"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { CASE_DOC_TYPES, findInsurer } from "@/lib/insurers";
import type { ApiAnalysis, ApiCase, ApiEmbeddedDoc } from "@/lib/serialize";

const DOC_LABELS: Record<string, string> = Object.fromEntries(
  CASE_DOC_TYPES.map((d) => [d.id, d.label]),
);

function bandStyle(band: ApiAnalysis["risk_band"]) {
  if (band === "green") {
    return "bg-[#E6F4EA] text-[#137333] border border-[#CEEAD6]";
  }
  if (band === "yellow") {
    return "bg-[#FEF7E0] text-[#B06000] border border-[#FAD28B]";
  }
  return "bg-[#FCE8E6] text-[#C5221F] border border-[#F9C2CB]";
}

export default function CaseDetailClient({ initial }: { initial: ApiCase }) {
  const router = useRouter();
  const [caseData, setCaseData] = useState<ApiCase>(initial);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const insurer = caseData.policy
    ? findInsurer(caseData.policy.insurer)
    : undefined;

  const created = new Date(caseData.created_at).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  async function runAnalysis() {
    setRunning(true);
    setError(null);
    try {
      const res = await fetch(`/api/cases/${caseData.id}/analyze`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Analysis failed");
        return;
      }
      setCaseData(data.case);
      router.push(`/dashboard/reports/${caseData.id}`);
    } catch {
      setError(
        "Network error — make sure the parser backend is running on :8000.",
      );
    } finally {
      setRunning(false);
    }
  }

  const analysis = caseData.analysis;

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/dashboard/cases"
          className="text-[13px] text-[color:var(--color-muted)] hover:text-[color:var(--color-ink)] inline-flex items-center gap-1"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path
              d="M15 18l-6-6 6-6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          All cases
        </Link>
      </div>

      <header className="bg-white border border-[color:var(--color-line)] rounded-xl p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-[24px] font-semibold tracking-tight">
              {caseData.patient_name}
            </h1>
            {caseData.diagnosis && (
              <p className="mt-1 text-[14px] text-[color:var(--color-muted)]">
                {caseData.diagnosis}
              </p>
            )}
          </div>
          {analysis && (
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold tracking-wide uppercase whitespace-nowrap ${bandStyle(analysis.risk_band)}`}
            >
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: "currentColor" }}
              />
              {analysis.risk_band} · {analysis.risk_score}
            </span>
          )}
        </div>

        <dl className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-[13px]">
          {caseData.hospital && (
            <Meta label="Hospital" value={caseData.hospital} />
          )}
          {caseData.admission_date && (
            <Meta label="Admitted" value={caseData.admission_date} />
          )}
          {insurer && (
            <Meta
              label="Policy"
              value={
                <span className="inline-flex items-center gap-1.5">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: insurer.accent }}
                  />
                  {insurer.short}
                  {caseData.policy?.policy_name
                    ? ` · ${caseData.policy.policy_name}`
                    : ""}
                </span>
              }
            />
          )}
          <Meta label="Added" value={created} />
        </dl>
      </header>

      <section className="bg-white border border-[color:var(--color-line)] rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[16px] font-semibold">Hospital documents</h2>
          <span className="text-[12px] text-[color:var(--color-muted)]">
            {caseData.documents.length} uploaded
          </span>
        </div>
        <ul className="divide-y divide-[color:var(--color-line)]">
          {caseData.documents.map((doc) => (
            <DocRow key={doc.id} doc={doc} />
          ))}
        </ul>
      </section>

      <section className="bg-white border border-[color:var(--color-line)] rounded-xl p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 className="text-[16px] font-semibold">Insurance check</h2>
            <p className="mt-1 text-[13px] text-[color:var(--color-muted)]">
              Cross-references your hospital documents against the linked policy
              and reports discrepancies that could lead to a rejection.
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            {analysis && (
              <Link
                href={`/dashboard/reports/${caseData.id}`}
                className="rounded-lg border border-[color:var(--color-brand)] text-[color:var(--color-brand)] hover:bg-[color:var(--color-brand-subtle)] px-4 py-2.5 text-[14px] font-semibold whitespace-nowrap"
              >
                View report →
              </Link>
            )}
            <button
              onClick={runAnalysis}
              disabled={running}
              className="rounded-lg bg-[color:var(--color-brand)] hover:bg-[color:var(--color-brand-hover)] disabled:opacity-60 px-4 py-2.5 text-[14px] font-semibold text-white whitespace-nowrap"
            >
              {running
                ? "Analysing…"
                : analysis
                  ? "Re-run analysis"
                  : "Run analysis"}
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-4 rounded-lg bg-red-50 border border-red-200 px-3.5 py-2.5 text-[13px] text-red-700">
            {error}
          </div>
        )}

        {running && <AnalysisLoader />}

        {!running && analysis && (
          <div className="mt-5 rounded-xl border border-[color:var(--color-line)] bg-[color:var(--color-surface)] p-5">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase whitespace-nowrap ${bandStyle(analysis.risk_band)}`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-current" />
                  {analysis.status.replace("_", " ")}
                </span>
                <div>
                  <div className="text-[12px] text-[color:var(--color-muted)] uppercase tracking-wide">
                    Risk score
                  </div>
                  <div className="text-[20px] font-bold">
                    {analysis.risk_score}
                    <span className="text-[13px] font-normal text-[color:var(--color-muted)]">
                      {" "}
                      / 100
                    </span>
                  </div>
                </div>
                <div className="pl-4 ml-2 border-l border-[color:var(--color-line)]">
                  <div className="text-[12px] text-[color:var(--color-muted)] uppercase tracking-wide">
                    Discrepancies
                  </div>
                  <div className="text-[20px] font-bold">
                    {analysis.discrepancies.length}
                  </div>
                </div>
              </div>
              <Link
                href={`/dashboard/reports/${caseData.id}`}
                className="text-[13px] font-semibold text-[color:var(--color-brand)] hover:underline whitespace-nowrap"
              >
                See full report →
              </Link>
            </div>
            {analysis.summary && (
              <p className="mt-4 text-[14px] leading-relaxed text-[color:var(--color-ink)]">
                {analysis.summary}
              </p>
            )}
          </div>
        )}

        {!running && !analysis && !error && (
          <div className="mt-4 rounded-lg border border-dashed border-[color:var(--color-line)] px-4 py-8 text-center">
            <p className="text-[14px] font-medium">No analysis yet</p>
            <p className="mt-1 text-[13px] text-[color:var(--color-muted)]">
              Click <span className="font-semibold">Run analysis</span> above to
              parse the documents and score this claim against your policy.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}

function Meta({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div>
      <dt className="text-[color:var(--color-muted)]">{label}</dt>
      <dd className="mt-0.5 font-medium">{value}</dd>
    </div>
  );
}

function DocRow({ doc }: { doc: ApiEmbeddedDoc }) {
  const label = DOC_LABELS[doc.doc_type] ?? doc.doc_type;
  const sizeKb = Math.max(1, Math.round(doc.size_bytes / 1024));
  return (
    <li className="py-3 flex items-center justify-between gap-3">
      <div className="min-w-0">
        <div className="text-[13px] font-medium truncate">
          {doc.original_name}
        </div>
        <div className="text-[12px] text-[color:var(--color-muted)]">
          {label} · {sizeKb} KB
        </div>
      </div>
      <span
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium whitespace-nowrap ${
          doc.parsed
            ? "bg-[#E6F4EA] text-[#137333] border border-[#CEEAD6]"
            : "bg-[color:var(--color-surface-alt)] text-[color:var(--color-muted)] border border-[color:var(--color-line)]"
        }`}
      >
        {doc.parsed ? "Parsed" : "Not parsed"}
      </span>
    </li>
  );
}

const LOADER_STEPS = [
  "Reading hospital documents",
  "Extracting policy clauses",
  "Cross-referencing with AI",
  "Generating discrepancy report",
];

function AnalysisLoader() {
  const [step, setStep] = useState(0);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const stepTimer = setInterval(() => {
      setStep((s) => Math.min(s + 1, LOADER_STEPS.length - 1));
    }, 9000);
    const elapsedTimer = setInterval(() => {
      setElapsed((e) => e + 1);
    }, 1000);
    return () => {
      clearInterval(stepTimer);
      clearInterval(elapsedTimer);
    };
  }, []);

  return (
    <div className="mt-4 rounded-xl border border-[color:var(--color-line)] bg-[color:var(--color-surface)] overflow-hidden">
      <div className="px-6 py-7 flex flex-col items-center text-center">
        <div className="relative w-12 h-12 mb-4">
          <div className="absolute inset-0 rounded-full border-2 border-[color:var(--color-brand-subtle)]" />
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[color:var(--color-brand)] animate-spin" />
        </div>
        <h3 className="text-[16px] font-semibold tracking-tight">
          Analysing your claim
        </h3>
        <p className="mt-1 text-[13px] text-[color:var(--color-muted)]">
          This can take up to a minute on first run · {formatElapsed(elapsed)}
        </p>
      </div>
      <ul className="border-t border-[color:var(--color-line)] divide-y divide-[color:var(--color-line)]">
        {LOADER_STEPS.map((label, i) => {
          const isDone = i < step;
          const isActive = i === step;
          return (
            <li
              key={label}
              className="px-6 py-3 flex items-center gap-3 text-[13px]"
            >
              <span className="w-5 h-5 shrink-0 flex items-center justify-center">
                {isDone ? (
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    className="text-[color:var(--color-brand)]"
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      fill="currentColor"
                      opacity="0.15"
                    />
                    <path
                      d="M8 12l3 3 5-6"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : isActive ? (
                  <span className="relative inline-flex w-3 h-3">
                    <span className="absolute inset-0 rounded-full bg-[color:var(--color-brand)] opacity-60 animate-ping" />
                    <span className="relative w-3 h-3 rounded-full bg-[color:var(--color-brand)]" />
                  </span>
                ) : (
                  <span className="w-3 h-3 rounded-full border border-[color:var(--color-line)] bg-white" />
                )}
              </span>
              <span
                className={
                  isActive
                    ? "font-semibold text-[color:var(--color-ink)]"
                    : isDone
                      ? "text-[color:var(--color-ink)]"
                      : "text-[color:var(--color-muted)]"
                }
              >
                {label}
              </span>
              {isActive && (
                <span className="ml-auto text-[11px] uppercase tracking-wider font-bold text-[color:var(--color-brand)]">
                  Running
                </span>
              )}
              {isDone && (
                <span className="ml-auto text-[11px] uppercase tracking-wider text-[color:var(--color-muted)]">
                  Done
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function formatElapsed(s: number): string {
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}m ${r}s`;
}
