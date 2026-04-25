import {
  cases,
  policies,
  toObjectId,
  type AnalysisResult,
  type CaseDoc,
  type EmbeddedDoc,
} from "@/lib/db";
import { requireUser, HttpError } from "@/lib/session";
import { parseAndIndexDocs } from "@/lib/parser";
import { serializeCase } from "@/lib/serialize";
import { missingEnvVars, runAnalysis } from "@/lib/analyzer";

export async function POST(
  _request: Request,
  ctx: RouteContext<"/api/cases/[id]/analyze">,
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
    const policyDoc = await policiesCol.findOne({
      _id: caseDoc.policy_id,
      user_id: user._id,
    });
    if (!policyDoc) {
      return Response.json(
        { error: "Linked policy not found" },
        { status: 404 },
      );
    }

    const userIdStr = user._id.toHexString();
    const policyIdStr = policyDoc._id.toHexString();
    const caseIdStr = caseDoc._id.toHexString();

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

    const policyNeedsParse = (policyDoc.documents ?? []).some(
      (d) => !d.parsed_text || d.parsed_text.length === 0,
    );
    if (policyNeedsParse) {
      const parsedPolicy = await parseAndIndexDocs(policyDoc.documents, {
        docType: "policy",
        scopeId: policyIdStr,
        userId: userIdStr,
      });
      const updatedPolicyDocs = parsedPolicy.map((p) => p.doc);
      policyDoc.documents = updatedPolicyDocs;
      await policiesCol.updateOne(
        { _id: policyDoc._id },
        { $set: { documents: updatedPolicyDocs } },
      );
    }

    const analysis: AnalysisResult = await runAnalysis({
      caseDoc,
      policyId: policyIdStr,
      userId: userIdStr,
    });

    await casesCol.updateOne(
      { _id: caseDoc._id },
      {
        $set: {
          analysis,
          [`comparisons.${policyIdStr}`]: analysis,
          risk_score: analysis.risk_band,
          status: analysis.status.toLowerCase(),
        },
      },
    );

    const updated = await casesCol.findOne({ _id: caseDoc._id });
    return Response.json({
      case: serializeCase(updated as CaseDoc, policyDoc),
    });
  } catch (e) {
    return handleError(e);
  }
}

function handleError(e: unknown) {
  if (e instanceof HttpError) {
    return Response.json({ error: e.message }, { status: e.status });
  }
  console.error("ANALYZE ERROR:", e);
  const msg = e instanceof Error ? e.message : "Internal error";
  return Response.json({ error: msg }, { status: 500 });
}
