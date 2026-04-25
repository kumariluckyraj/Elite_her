import {
  cases,
  ObjectId,
  policies,
  toObjectId,
  type CaseDoc,
  type EmbeddedDoc,
} from "@/lib/db";
import { requireUser, HttpError } from "@/lib/session";
import { saveUpload } from "@/lib/uploads";
import { CASE_DOC_TYPES } from "@/lib/insurers";
import { serializeCase } from "@/lib/serialize";

export async function GET() {
  try {
    const user = await requireUser();
    const casesCol = await cases();
    const policiesCol = await policies();

    const list = await casesCol
      .find({ user_id: user._id })
      .sort({ created_at: -1 })
      .toArray();

    const policyIds = Array.from(new Set(list.map((c) => c.policy_id.toHexString())));
    const policyDocs = await policiesCol
      .find(
        { _id: { $in: policyIds.map((id) => new ObjectId(id)) } },
        { projection: { insurer: 1, policy_name: 1 } },
      )
      .toArray();
    const byId = new Map(policyDocs.map((p) => [p._id.toHexString(), p]));

    return Response.json({
      cases: list.map((c) =>
        serializeCase(c, byId.get(c.policy_id.toHexString()) ?? null),
      ),
    });
  } catch (e) {
    return handleError(e);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const form = await request.formData();

    const policyIdStr = String(form.get("policy_id") ?? "");
    const policyOid = toObjectId(policyIdStr);
    if (!policyOid) {
      return Response.json({ error: "Select a policy" }, { status: 400 });
    }

    const policiesCol = await policies();
    const policy = await policiesCol.findOne({
      _id: policyOid,
      user_id: user._id,
    });
    if (!policy) {
      return Response.json({ error: "Policy not found" }, { status: 404 });
    }

    const patientName = strOrNull(form.get("patient_name"));
    if (!patientName) {
      return Response.json(
        { error: "Patient name is required" },
        { status: 400 },
      );
    }
    const hospital = strOrNull(form.get("hospital"));
    const diagnosis = strOrNull(form.get("diagnosis"));
    const admissionDate = strOrNull(form.get("admission_date"));

    const filesByType = new Map<string, File[]>();
    for (const docType of CASE_DOC_TYPES) {
      const entries = form.getAll(`doc_${docType.id}`);
      const files = entries.filter(
        (e): e is File => e instanceof File && e.size > 0,
      );
      if (files.length > 0) filesByType.set(docType.id, files);
    }

    if (
      !filesByType.has("discharge_summary") ||
      !filesByType.has("hospital_bill")
    ) {
      return Response.json(
        { error: "Discharge summary and hospital bill are required" },
        { status: 400 },
      );
    }

    const caseId = new ObjectId();
    const embedded: EmbeddedDoc[] = [];
    for (const [docType, files] of filesByType.entries()) {
      for (const file of files) {
        const saved = await saveUpload(file, `cases/${caseId.toHexString()}`);
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

    const caseDoc: CaseDoc = {
      _id: caseId,
      user_id: user._id,
      policy_id: policyOid,
      patient_name: patientName,
      hospital,
      diagnosis,
      admission_date: admissionDate,
      risk_score: null,
      status: "pending",
      created_at: new Date(),
      documents: embedded,
    };

    const casesCol = await cases();
    await casesCol.insertOne(caseDoc);

    return Response.json(
      { case: serializeCase(caseDoc, policy) },
      { status: 201 },
    );
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
