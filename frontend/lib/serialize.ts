import type {
  CaseDoc,
  EmbeddedDoc,
  PolicyDoc,
  UserDoc,
} from "./db";

export type ApiUser = {
  id: string;
  email: string;
  created_at: string;
};

export type ApiEmbeddedDoc = {
  id: string;
  doc_type: string;
  original_name: string;
  stored_path: string;
  size_bytes: number;
  mime_type: string | null;
  uploaded_at: string;
};

export type ApiPolicy = {
  id: string;
  insurer: string;
  policy_name: string | null;
  policy_number: string | null;
  sum_insured: string | null;
  valid_till: string | null;
  status: string;
  created_at: string;
  documents: ApiEmbeddedDoc[];
};

export type ApiCase = {
  id: string;
  policy_id: string;
  patient_name: string;
  hospital: string | null;
  diagnosis: string | null;
  admission_date: string | null;
  risk_score: string | null;
  status: string;
  created_at: string;
  documents: ApiEmbeddedDoc[];
  policy: { id: string; insurer: string; policy_name: string | null } | null;
};

export function serializeUser(u: UserDoc): ApiUser {
  return {
    id: u._id.toHexString(),
    email: u.email,
    created_at: u.created_at.toISOString(),
  };
}

function serializeEmbedded(d: EmbeddedDoc): ApiEmbeddedDoc {
  return {
    id: d._id.toHexString(),
    doc_type: d.doc_type,
    original_name: d.original_name,
    stored_path: d.stored_path,
    size_bytes: d.size_bytes,
    mime_type: d.mime_type,
    uploaded_at: d.uploaded_at.toISOString(),
  };
}

export function serializePolicy(p: PolicyDoc): ApiPolicy {
  return {
    id: p._id.toHexString(),
    insurer: p.insurer,
    policy_name: p.policy_name,
    policy_number: p.policy_number,
    sum_insured: p.sum_insured,
    valid_till: p.valid_till,
    status: p.status,
    created_at: p.created_at.toISOString(),
    documents: (p.documents ?? []).map(serializeEmbedded),
  };
}

export function serializeCase(
  c: CaseDoc,
  policy: PolicyDoc | { _id: import("mongodb").ObjectId; insurer: string; policy_name: string | null } | null,
): ApiCase {
  return {
    id: c._id.toHexString(),
    policy_id: c.policy_id.toHexString(),
    patient_name: c.patient_name,
    hospital: c.hospital,
    diagnosis: c.diagnosis,
    admission_date: c.admission_date,
    risk_score: c.risk_score,
    status: c.status,
    created_at: c.created_at.toISOString(),
    documents: (c.documents ?? []).map(serializeEmbedded),
    policy: policy
      ? {
          id: policy._id.toHexString(),
          insurer: policy.insurer,
          policy_name: policy.policy_name,
        }
      : null,
  };
}
