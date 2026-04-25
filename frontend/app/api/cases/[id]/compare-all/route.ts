import {
  cases,
  policies,
  toObjectId,
  type AnalysisResult,
  type CaseDoc,
  type EmbeddedDoc,
  type PolicyDoc,
} from "@/lib/db";
import { requireUser, HttpError } from "@/lib/session";
import { parseAndIndexDocs } from "@/lib/parser";
import { serializeCase } from "@/lib/serialize";
import { missingEnvVars, runAnalysis } from "@/lib/analyzer";

export async function POST(
  _request: Request,
  ctx: RouteContext<"/api/cases/[id]/compare-all">,
) {
  try {
    const user = await requireUser();

    const missing = missingEnvVars();
    if (missing.length > 0) {
      return Response.json(
        { error: `Missing env vars: ${missing.join(", ")}` },
        { status: 500 },
      );
    }

    const { id } = await ctx.params;
    const oid = toObjectId(id);
    if (!oid) {
      return Response.json({ error: "Case not found" }, { status: 404 });
    }

    const casesCol = await cases();
    const caseDoc = await casesCol.findOne({ _id: oid, user_id: user._id });
    if (!caseDoc) {
      return Response.json({ error: "Case not found" }, { status: 404 });
    }

    const policiesCol = await policies();
    const policyList = await policiesCol
      .find({ user_id: user._id })
      .sort({ created_at: -1 })
      .toArray();
    if (policyList.length === 0) {
      return Response.json(
        { error: "Add at least one policy first" },
        { status: 400 },
      );
    }

    const userIdStr = user._id.toHexString();
    const caseIdStr = caseDoc._id.toHexString();

    // Step 1: Parse + index case docs once. Cached after first run.
    const parsedCaseDocs = await parseAndIndexDocs(caseDoc.documents, {
      docType: "case",
      scopeId: caseIdStr,
      userId: userIdStr,
    });
    const updatedCaseDocs: EmbeddedDoc[] = parsedCaseDocs.map((p) => p.doc);
    if (parsedCaseDocs.some((p) => !p.fromCache)) {
      await casesCol.updateOne(
        { _id: caseDoc._id },
        { $set: { documents: updatedCaseDocs } },
      );
    }
    caseDoc.documents = updatedCaseDocs;

    // Step 2: Ensure each policy is parsed + indexed, then run analysis in parallel.
    const tasks = policyList.map((policy) =>
      analyzeOnePolicy({
        caseDoc,
        policy,
        userIdStr,
        policiesCol,
      }),
    );
    const settled = await Promise.allSettled(tasks);

    const comparisons: Record<string, AnalysisResult> = {
      ...(caseDoc.comparisons ?? {}),
    };
    const failures: { policyId: string; error: string }[] = [];

    settled.forEach((r, i) => {
      const policy = policyList[i];
      const pid = policy._id.toHexString();
      if (r.status === "fulfilled") {
        comparisons[pid] = r.value;
      } else {
        const msg = r.reason instanceof Error ? r.reason.message : "Failed";
        console.error(`Compare failed for policy ${pid}:`, r.reason);
        failures.push({ policyId: pid, error: msg });
      }
    });

    // Refresh primary analysis from comparisons[caseDoc.policy_id], if available.
    const primaryId = caseDoc.policy_id.toHexString();
    const primary = comparisons[primaryId] ?? caseDoc.analysis ?? null;

    const update: Record<string, unknown> = { comparisons };
    if (primary) {
      update.analysis = primary;
      update.risk_score = primary.risk_band;
      update.status = primary.status.toLowerCase();
    }
    await casesCol.updateOne({ _id: caseDoc._id }, { $set: update });

    const linkedPolicy =
      policyList.find((p) => p._id.equals(caseDoc.policy_id)) ?? null;
    const updated = await casesCol.findOne({ _id: caseDoc._id });

    return Response.json({
      case: serializeCase(updated as CaseDoc, linkedPolicy),
      failures,
    });
  } catch (e) {
    return handleError(e);
  }
}

async function analyzeOnePolicy({
  caseDoc,
  policy,
  userIdStr,
  policiesCol,
}: {
  caseDoc: CaseDoc;
  policy: PolicyDoc;
  userIdStr: string;
  policiesCol: Awaited<ReturnType<typeof policies>>;
}): Promise<AnalysisResult> {
  const policyIdStr = policy._id.toHexString();

  const policyNeedsParse = (policy.documents ?? []).some(
    (d) => !d.parsed_text || d.parsed_text.length === 0,
  );
  if (policyNeedsParse) {
    const parsedPolicy = await parseAndIndexDocs(policy.documents, {
      docType: "policy",
      scopeId: policyIdStr,
      userId: userIdStr,
    });
    const updatedDocs = parsedPolicy.map((p) => p.doc);
    policy.documents = updatedDocs;
    await policiesCol.updateOne(
      { _id: policy._id },
      { $set: { documents: updatedDocs } },
    );
  }

  return runAnalysis({
    caseDoc,
    policyId: policyIdStr,
    userId: userIdStr,
  });
}

function handleError(e: unknown) {
  if (e instanceof HttpError) {
    return Response.json({ error: e.message }, { status: e.status });
  }
  console.error("COMPARE ERROR:", e);
  const msg = e instanceof Error ? e.message : "Internal error";
  return Response.json({ error: msg }, { status: 500 });
}
