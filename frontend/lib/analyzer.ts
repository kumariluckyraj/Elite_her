import OpenAI from "openai";
import {
  type AnalysisResult,
  type CaseDoc,
  type Discrepancy,
} from "./db";
import { retrievePolicyChunks, type RetrievedChunk } from "./rag";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
  baseURL: process.env.OPENAI_API_BASE,
});

const MODEL = process.env.LLM ?? "gpt-5.4-mini-2026-03-17";

const SYSTEM_PROMPT = `You are Indira, a strict but fair Indian health-insurance claim auditor.

Cross-reference the CLAIM CONTEXT (hospital documents) against the POLICY CONTEXT (relevant clauses retrieved from the user's policy). Identify every discrepancy that could lead to a rejection or partial settlement.

Discrepancy categories:
- waiting_period — initial / PED / specific-disease waiting period violation
- exclusion — condition/procedure permanently excluded
- sub_limit — disease-specific or room-rent sub-limit breach
- ped — pre-existing-disease disclosure issue
- documentation — missing or inconsistent paperwork
- room_rent — room rent exceeds limit (proportionate deduction risk)
- pre_auth — required pre-authorization not obtained
- other — anything else

For each discrepancy give:
- severity ("high" | "medium" | "low")
- title (short)
- detail (what specifically is wrong, citing numbers/dates from the claim)
- policy_clause (verbatim quote from policy context, or null if not in retrieved context)
- suggested_action (concrete fix the policyholder can take now)

Then assign:
- status: APPROVED (no material issues) | NEEDS_REVIEW (fixable issues) | REJECTED (clear deterministic rejection grounds)
- risk_score: integer 0-100 (probability of rejection or partial denial)
- summary: 2-3 sentence plain-English overview

OUTPUT MUST BE VALID JSON ONLY matching this shape:
{
  "status": "APPROVED" | "REJECTED" | "NEEDS_REVIEW",
  "risk_score": number,
  "summary": string,
  "discrepancies": [
    {
      "severity": "high" | "medium" | "low",
      "category": "waiting_period" | "exclusion" | "sub_limit" | "ped" | "documentation" | "room_rent" | "pre_auth" | "other",
      "title": string,
      "detail": string,
      "policy_clause": string | null,
      "suggested_action": string
    }
  ]
}`;

const VALID_CATEGORIES: Discrepancy["category"][] = [
  "waiting_period",
  "exclusion",
  "sub_limit",
  "ped",
  "documentation",
  "room_rent",
  "pre_auth",
  "other",
];
const VALID_SEVERITIES: Discrepancy["severity"][] = ["high", "medium", "low"];

function safeJSONParse(text: string): unknown {
  try {
    const cleaned = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .replace(/^[^{]*/, "")
      .trim();
    return JSON.parse(cleaned);
  } catch {
    return null;
  }
}

export function bandFor(score: number): "green" | "yellow" | "red" {
  if (score >= 70) return "red";
  if (score >= 40) return "yellow";
  return "green";
}

function coerceDiscrepancy(raw: unknown): Discrepancy | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const severity = VALID_SEVERITIES.includes(r.severity as Discrepancy["severity"])
    ? (r.severity as Discrepancy["severity"])
    : "medium";
  const category = VALID_CATEGORIES.includes(r.category as Discrepancy["category"])
    ? (r.category as Discrepancy["category"])
    : "other";
  const title = typeof r.title === "string" ? r.title : "";
  const detail = typeof r.detail === "string" ? r.detail : "";
  if (!title || !detail) return null;
  const rawClause =
    typeof r.policy_clause === "string" ? r.policy_clause.trim() : "";
  const clauseLower = rawClause.toLowerCase();
  const policy_clause =
    rawClause && clauseLower !== "null" && clauseLower !== "none"
      ? rawClause
      : null;
  return {
    severity,
    category,
    title,
    detail,
    policy_clause,
    suggested_action:
      typeof r.suggested_action === "string" ? r.suggested_action : "",
  };
}

function buildClaimSummary(c: CaseDoc): string {
  const parts: string[] = [];
  parts.push(`Patient: ${c.patient_name}`);
  if (c.diagnosis) parts.push(`Diagnosis: ${c.diagnosis}`);
  if (c.hospital) parts.push(`Hospital: ${c.hospital}`);
  if (c.admission_date) parts.push(`Admission date: ${c.admission_date}`);
  for (const d of c.documents) {
    if (!d.parsed_text) continue;
    parts.push(`\n--- ${d.doc_type.toUpperCase()} (${d.original_name}) ---`);
    parts.push(d.parsed_text.slice(0, 6000));
  }
  return parts.join("\n");
}

async function gatherPolicyContext(
  caseDoc: CaseDoc,
  policyId: string,
  userId: string,
): Promise<string> {
  const queries: string[] = [];
  if (caseDoc.diagnosis) {
    queries.push(`coverage for ${caseDoc.diagnosis}`);
    queries.push(`waiting period for ${caseDoc.diagnosis}`);
    queries.push(`exclusions related to ${caseDoc.diagnosis}`);
    queries.push(`sub-limit for ${caseDoc.diagnosis}`);
  }
  queries.push("room rent limit and proportionate deduction");
  queries.push("pre-authorization requirements for hospitalization");
  queries.push("pre-existing disease disclosure waiting period");

  const seen = new Set<string>();
  const collected: RetrievedChunk[] = [];
  for (const q of queries) {
    try {
      const chunks = await retrievePolicyChunks(q, {
        policyId,
        userId,
        topK: 4,
      });
      for (const ch of chunks) {
        if (seen.has(ch.id)) continue;
        seen.add(ch.id);
        collected.push(ch);
      }
    } catch (err) {
      console.error("Pinecone query failed:", q, err);
    }
  }
  collected.sort((a, b) => b.score - a.score);
  const top = collected.slice(0, 12);
  return top.map((c, i) => `[Clause ${i + 1}] ${c.text}`).join("\n\n");
}

export type RunAnalysisInput = {
  caseDoc: CaseDoc;
  policyId: string;
  userId: string;
};

/**
 * Runs the LLM-backed analysis of a case against a single policy. Caller is
 * responsible for ensuring case + policy documents are already parsed and
 * indexed in Pinecone.
 */
export async function runAnalysis({
  caseDoc,
  policyId,
  userId,
}: RunAnalysisInput): Promise<AnalysisResult> {
  const policyContext = await gatherPolicyContext(caseDoc, policyId, userId);

  if (!policyContext.trim()) {
    return {
      status: "NEEDS_REVIEW",
      risk_score: 65,
      risk_band: "yellow",
      summary:
        "We couldn't retrieve any relevant policy clauses for this claim. The policy document may not have indexed correctly — re-upload the policy and try again.",
      discrepancies: [
        {
          severity: "high",
          category: "documentation",
          title: "Policy not searchable",
          detail:
            "No policy chunks were retrieved from the vector index for this claim's diagnosis or coverage queries.",
          policy_clause: null,
          suggested_action:
            "Delete and re-upload the policy document so it gets parsed and indexed.",
        },
      ],
      analyzed_at: new Date(),
    };
  }

  const claimSummary = buildClaimSummary(caseDoc);

  const completion = await openai.chat.completions.create({
    model: MODEL,
    temperature: 0,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: `POLICY CONTEXT:\n${policyContext}\n\nCLAIM CONTEXT:\n${claimSummary}`,
      },
    ],
  });

  const raw = completion.choices[0]?.message?.content ?? "{}";
  const parsed = safeJSONParse(raw) as Record<string, unknown> | null;

  if (!parsed) {
    return {
      status: "NEEDS_REVIEW",
      risk_score: 50,
      risk_band: "yellow",
      summary: "Model returned an unparseable response. Try re-running.",
      discrepancies: [],
      analyzed_at: new Date(),
    };
  }

  const status =
    parsed.status === "APPROVED" ||
    parsed.status === "REJECTED" ||
    parsed.status === "NEEDS_REVIEW"
      ? parsed.status
      : "NEEDS_REVIEW";
  const rawScore =
    typeof parsed.risk_score === "number" ? parsed.risk_score : 50;
  const score = Math.max(0, Math.min(100, Math.round(rawScore)));
  const discrepancies: Discrepancy[] = Array.isArray(parsed.discrepancies)
    ? parsed.discrepancies
        .map(coerceDiscrepancy)
        .filter((d): d is Discrepancy => d !== null)
    : [];
  return {
    status,
    risk_score: score,
    risk_band: bandFor(score),
    summary: typeof parsed.summary === "string" ? parsed.summary : "",
    discrepancies,
    analyzed_at: new Date(),
  };
}

export const REQUIRED_ENV_VARS = [
  "OPENAI_API_KEY",
  "OPENAI_API_BASE",
  "PINECONE_API_KEY",
  "PINECONE_INDEX",
];

export function missingEnvVars(): string[] {
  return REQUIRED_ENV_VARS.filter((k) => !process.env[k]);
}
