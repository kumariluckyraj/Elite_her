import { ObjectId, policies, type EmbeddedDoc, type PolicyDoc } from "@/lib/db";
import { requireUser, HttpError } from "@/lib/session";
import { saveUpload } from "@/lib/uploads";
import { findInsurer, POLICY_DOC_TYPES } from "@/lib/insurers";
import { serializePolicy } from "@/lib/serialize";
import { parseAndIndexDocs } from "@/lib/parser";

export async function GET() {
  try {
    const user = await requireUser();
    const col = await policies();
    const docs = await col
      .find({ user_id: user._id })
      .sort({ created_at: -1 })
      .toArray();
    return Response.json({ policies: docs.map(serializePolicy) });
  } catch (e) {
    return handleError(e);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const form = await request.formData();

    const insurerId = String(form.get("insurer") ?? "");
    const insurer = findInsurer(insurerId);
    if (!insurer) {
      return Response.json({ error: "Select a valid insurer" }, { status: 400 });
    }

    const policyName = strOrNull(form.get("policy_name"));
    const policyNumber = strOrNull(form.get("policy_number"));
    const sumInsured = strOrNull(form.get("sum_insured"));
    const validTill = strOrNull(form.get("valid_till"));

    const filesByType = new Map<string, File[]>();
    for (const docType of POLICY_DOC_TYPES) {
      const entries = form.getAll(`doc_${docType.id}`);
      const files = entries.filter(
        (e): e is File => e instanceof File && e.size > 0,
      );
      if (files.length > 0) filesByType.set(docType.id, files);
    }

    if (!filesByType.has("primary")) {
      return Response.json(
        { error: "Primary policy document is required" },
        { status: 400 },
      );
    }

    const policyId = new ObjectId();
    const embedded: EmbeddedDoc[] = [];
    for (const [docType, files] of filesByType.entries()) {
      for (const file of files) {
        const saved = await saveUpload(file, `policies/${policyId.toHexString()}`);
        embedded.push({
          _id: new ObjectId(),
          doc_type: docType,
          original_name: saved.originalName,
          stored_path: saved.storedPath,
          size_bytes: saved.size,
          mime_type: saved.mime,
          uploaded_at: new Date(),
        });
      }
    }

    const policy: PolicyDoc = {
      _id: policyId,
      user_id: user._id,
      insurer: insurer.id,
      policy_name: policyName,
      policy_number: policyNumber,
      sum_insured: sumInsured,
      valid_till: validTill,
      status: "parsed",
      created_at: new Date(),
      documents: embedded,
    };

    const col = await policies();
    await col.insertOne(policy);

    try {
      const parsed = await parseAndIndexDocs(embedded, {
        docType: "policy",
        scopeId: policyId.toHexString(),
        userId: user._id.toHexString(),
      });
      const updatedDocs = parsed.map((p) => p.doc);
      policy.documents = updatedDocs;
      await col.updateOne(
        { _id: policyId },
        { $set: { documents: updatedDocs } },
      );
    } catch (err) {
      console.error("Policy parse/index failed:", err);
    }

    return Response.json({ policy: serializePolicy(policy) }, { status: 201 });
  } catch (e) {
    return handleError(e);
  }
}

function strOrNull(v: FormDataEntryValue | null): string | null {
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t.length === 0 ? null : t;
}

function handleError(e: unknown) {
  if (e instanceof HttpError) {
    return Response.json({ error: e.message }, { status: e.status });
  }
  console.error(e);
  return Response.json({ error: "Internal error" }, { status: 500 });
}
