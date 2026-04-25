"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { findInsurer } from "@/lib/insurers";
import type {
  ApiAnalysis,
  ApiCase,
  ApiDiscrepancy,
  ApiPolicy,
} from "@/lib/serialize";

const STATUS_LABEL: Record<ApiAnalysis["status"], string> = {
  APPROVED: "Approved",
  NEEDS_REVIEW: "Needs review",
  REJECTED: "Rejected",
};

function bandColor(band: ApiAnalysis["risk_band"]): string {
  if (band === "green") return "#0F9D58";
  if (band === "yellow") return "#F6A93B";
  return "#E5484D";
}

function bandPill(band: ApiAnalysis["risk_band"]): string {
  if (band === "green")
    return "bg-[#E6F4EA] text-[#137333] border border-[#CEEAD6]";
  if (band === "yellow")
    return "bg-[#FEF7E0] text-[#B06000] border border-[#FAD28B]";
  return "bg-[#FCE8E6] text-[#C5221F] border border-[#F9C2CB]";
}

function formatINR(value: string | null): string | null {
  if (!value) return null;
  const n = Number(value.replace(/[^\d.]/g, ""));
  if (Number.isNaN(n)) return value;
  return `₹${n.toLocaleString("en-IN")}`;
}

export default function CompareClient({
  cases,
  policies,
  initialCaseId,
}: {
  cases: ApiCase[];
  policies: ApiPolicy[];
  initialCaseId: string | null;
}) {
  const [caseId, setCaseId] = useState<string | null>(initialCaseId);
  const [data, setData] = useState<Record<string, ApiCase>>(() =>
    Object.fromEntries(cases.map((c) => [c.id, c])),
  );
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedCase = caseId ? data[caseId] : null;

  // No policies → block early.
  if (policies.length === 0) {
    return (
      <div className="space-y-6">
        <Header />
        <EmptyState
          title="Add a policy first"
          body="Comparisons need at least one uploaded policy. Go to Policies and add one."
          ctaHref="/dashboard/policies"
          ctaLabel="Go to Policies"
        />
      </div>
    );
  }

  // No cases → block early.
  if (cases.length === 0) {
    return (
      <div className="space-y-6">
        <Header />
        <EmptyState
          title="Add a case first"
          body="Add a hospitalization case so we have something to compare against your policies."
          ctaHref="/dashboard/cases"
          ctaLabel="Go to Cases"
        />
      </div>
    );
  }

  async function runComparison() {
    if (!caseId) return;
    setRunning(true);
    setError(null);
    try {
      const res = await fetch(`/api/cases/${caseId}/compare-all`, {
        method: "POST",
      });
      const body = await res.json();
      if (!res.ok) {
        setError(body.error ?? "Comparison failed");
        return;
      }
      setData((prev) => ({ ...prev, [body.case.id]: body.case as ApiCase }));
    } catch {
      setError("Network error.");
    } finally {
      setRunning(false);
    }
  }

  return (
    <div className="space-y-6">
      <Header />

      <ControlBar
        cases={cases}
        selected={caseId}
        onSelect={setCaseId}
        onRun={runComparison}
        running={running}
        hasResults={
          !!selectedCase && Object.keys(selectedCase.comparisons).length > 0
        }
      />

      {error && (
        <div className="border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-700">
          {error}
        </div>
      )}

      {selectedCase && (
        <ComparisonMatrix
          caseData={selectedCase}
          policies={policies}
          running={running}
        />
      )}
    </div>
  );
}

function Header() {
  return (
    <header className="flex items-end justify-between gap-4">
      <div>
        <div className="text-[11px] font-bold uppercase tracking-[0.1em] text-brand">
          Decision matrix
        </div>
        <h1 className="mt-1.5 text-[28px] font-semibold tracking-tight">
          Compare a case across your policies
        </h1>
        <p className="mt-1 text-[14px] text-muted max-w-[640px]">
          See how the same hospitalization claim would fare against every policy
          you&apos;ve uploaded — verdict, risk score, top issues, and the
          best-fit policy at a glance.
        </p>
      </div>
    </header>
  );
}

function ControlBar({
  cases,
  selected,
  onSelect,
  onRun,
  running,
  hasResults,
}: {
  cases: ApiCase[];
  selected: string | null;
  onSelect: (id: string) => void;
  onRun: () => void;
  running: boolean;
  hasResults: boolean;
}) {
  return (
    <section className="border border-line bg-white">
      <div className="grid grid-cols-1 md:grid-cols-3">
        <div className="md:col-span-2 px-6 py-5 md:border-r border-line border-b md:border-b-0">
          <div className="text-[11px] font-bold uppercase tracking-[0.08em] text-muted mb-2">
            Case
          </div>
          <select
            value={selected ?? ""}
            onChange={(e) => onSelect(e.target.value)}
            className="w-full rounded-lg border border-line px-3.5 py-2.5 text-[14px] bg-white focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
          >
            {cases.map((c) => (
              <option key={c.id} value={c.id}>
                {c.patient_name}
                {c.diagnosis ? ` — ${c.diagnosis}` : ""}
                {c.admission_date ? ` (${c.admission_date})` : ""}
              </option>
            ))}
          </select>
        </div>
        <div className="px-6 py-5 flex items-end justify-between gap-4">
          <div className="min-w-0">
            <div className="text-[11px] font-bold uppercase tracking-[0.08em] text-muted">
              Action
            </div>
            <p className="mt-1 text-[12px] text-muted leading-snug">
              Runs the audit against every policy. Cached results reuse
              instantly.
            </p>
          </div>
          <button
            onClick={onRun}
            disabled={running}
            className="rounded-lg bg-brand hover:bg-brand-hover disabled:opacity-60 px-5 py-2.5 text-[13px] font-semibold text-white whitespace-nowrap shadow-sm"
          >
            {running ? "Running…" : hasResults ? "Re-run all" : "Run comparison"}
          </button>
        </div>
      </div>
    </section>
  );
}

function ComparisonMatrix({
  caseData,
  policies,
  running,
}: {
  caseData: ApiCase;
  policies: ApiPolicy[];
  running: boolean;
}) {
  // Best-fit policy = lowest risk score among scored ones.
  const best = useMemo(() => {
    let bestId: string | null = null;
    let bestScore = Infinity;
    for (const p of policies) {
      const a = caseData.comparisons[p.id];
      if (!a) continue;
      if (a.risk_score < bestScore) {
        bestScore = a.risk_score;
        bestId = p.id;
      }
    }
    return bestId;
  }, [caseData.comparisons, policies]);

  return (
    <div className="border border-line bg-white overflow-hidden">
      {/* Sticky-ish horizontal scroll wrapper */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse min-w-[820px]">
          <thead>
            <tr>
              <th className="w-[180px] sticky left-0 bg-white z-10 border-b border-line text-left">
                <div className="px-5 py-4">
                  <div className="text-[11px] font-bold uppercase tracking-[0.08em] text-muted">
                    Comparing
                  </div>
                  <div className="mt-1 text-[15px] font-semibold leading-tight">
                    {caseData.patient_name}
                  </div>
                  {caseData.diagnosis && (
                    <div className="mt-0.5 text-[12px] text-muted">
                      {caseData.diagnosis}
                    </div>
                  )}
                </div>
              </th>
              {policies.map((p) => (
                <PolicyHeader
                  key={p.id}
                  policy={p}
                  isPrimary={p.id === caseData.policy_id}
                  isBest={p.id === best}
                />
              ))}
            </tr>
          </thead>
          <tbody>
            <Row label="Verdict">
              {policies.map((p) => (
                <VerdictCell
                  key={p.id}
                  analysis={caseData.comparisons[p.id]}
                  running={running}
                />
              ))}
            </Row>
            <Row label="Approval confidence">
              {policies.map((p) => (
                <ConfidenceCell
                  key={p.id}
                  analysis={caseData.comparisons[p.id]}
                />
              ))}
            </Row>
            <Row label="Risk score">
              {policies.map((p) => (
                <RiskScoreCell
                  key={p.id}
                  analysis={caseData.comparisons[p.id]}
                />
              ))}
            </Row>
            <Row label="Discrepancies">
              {policies.map((p) => (
                <DiscrepancyCell
                  key={p.id}
                  analysis={caseData.comparisons[p.id]}
                />
              ))}
            </Row>
            <Row label="Top issue">
              {policies.map((p) => (
                <TopIssueCell
                  key={p.id}
                  analysis={caseData.comparisons[p.id]}
                />
              ))}
            </Row>
            <Row label="Sum insured">
              {policies.map((p) => (
                <td
                  key={p.id}
                  className="align-top px-5 py-4 border-t border-l border-line text-[13px]"
                >
                  <div className="font-semibold">
                    {formatINR(p.sum_insured) ?? "—"}
                  </div>
                  {p.valid_till && (
                    <div className="mt-0.5 text-[11px] text-muted">
                      Valid till {p.valid_till}
                    </div>
                  )}
                </td>
              ))}
            </Row>
            <Row label="Suggested fix">
              {policies.map((p) => (
                <SuggestedFixCell
                  key={p.id}
                  analysis={caseData.comparisons[p.id]}
                />
              ))}
            </Row>
            <Row label="Open report">
              {policies.map((p) => (
                <td
                  key={p.id}
                  className="align-top px-5 py-4 border-t border-l border-line"
                >
                  {caseData.comparisons[p.id] ? (
                    <Link
                      href={`/dashboard/reports/${caseData.id}`}
                      className="text-[12px] font-semibold text-brand hover:underline"
                    >
                      View detail →
                    </Link>
                  ) : (
                    <span className="text-[12px] text-muted">—</span>
                  )}
                </td>
              ))}
            </Row>
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PolicyHeader({
  policy,
  isPrimary,
  isBest,
}: {
  policy: ApiPolicy;
  isPrimary: boolean;
  isBest: boolean;
}) {
  const insurer = findInsurer(policy.insurer);
  const accent = insurer?.accent ?? "#666";
  return (
    <th className="align-top text-left border-b border-l border-line min-w-[220px]">
      <div className="relative">
        {/* Top accent strip */}
        <div className="h-1 w-full" style={{ backgroundColor: accent }} />
        <div className="px-5 pt-4 pb-3">
          <div className="flex items-center gap-2.5">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center text-white text-[12px] font-bold shrink-0"
              style={{ backgroundColor: accent }}
            >
              {(insurer?.short ?? policy.insurer).slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="text-[14px] font-semibold truncate">
                {insurer?.short ?? policy.insurer}
              </div>
              <div className="text-[11px] text-muted truncate">
                {policy.policy_name ?? "—"}
              </div>
            </div>
          </div>
          <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
            {isBest && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide bg-brand text-white">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 2l2.39 7.36H22l-6.18 4.49L18.21 21 12 16.27 5.79 21l2.39-7.15L2 9.36h7.61z"
                    fill="currentColor"
                  />
                </svg>
                Best fit
              </span>
            )}
            {isPrimary && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide bg-surface-alt text-muted border border-line">
                Linked
              </span>
            )}
          </div>
        </div>
      </div>
    </th>
  );
}

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <tr className="hover:bg-surface/40 transition-colors">
      <th
        scope="row"
        className="sticky left-0 bg-white z-10 align-top text-left px-5 py-4 border-t border-line"
      >
        <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-muted">
          {label}
        </span>
      </th>
      {children}
    </tr>
  );
}

function PendingCell({ running }: { running: boolean }) {
  return (
    <td className="align-top px-5 py-4 border-t border-l border-line">
      {running ? (
        <div className="flex items-center gap-2 text-[12px] text-muted">
          <span className="relative inline-flex w-2.5 h-2.5">
            <span className="absolute inset-0 rounded-full bg-brand opacity-60 animate-ping" />
            <span className="relative w-2.5 h-2.5 rounded-full bg-brand" />
          </span>
          Analysing…
        </div>
      ) : (
        <span className="text-[12px] text-muted">Not yet analysed</span>
      )}
    </td>
  );
}

function VerdictCell({
  analysis,
  running,
}: {
  analysis: ApiAnalysis | undefined;
  running: boolean;
}) {
  if (!analysis) return <PendingCell running={running} />;
  return (
    <td className="align-top px-5 py-4 border-t border-l border-line">
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide ${bandPill(analysis.risk_band)}`}
      >
        <span
          className="w-1.5 h-1.5 rounded-full"
          style={{ backgroundColor: "currentColor" }}
        />
        {STATUS_LABEL[analysis.status]}
      </span>
    </td>
  );
}

function ConfidenceCell({
  analysis,
}: {
  analysis: ApiAnalysis | undefined;
}) {
  if (!analysis) {
    return (
      <td className="align-top px-5 py-4 border-t border-l border-line">
        <span className="text-[12px] text-muted">—</span>
      </td>
    );
  }
  const confidence = 100 - analysis.risk_score;
  const color = bandColor(analysis.risk_band);
  return (
    <td className="align-top px-5 py-4 border-t border-l border-line">
      <div className="flex items-baseline gap-1.5 mb-1.5">
        <span
          className="text-[20px] font-bold leading-none tracking-tight tabular-nums"
          style={{ color }}
        >
          {confidence}%
        </span>
      </div>
      <div className="h-1.5 w-full bg-surface-alt overflow-hidden rounded-full">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${confidence}%`, backgroundColor: color }}
        />
      </div>
    </td>
  );
}

function RiskScoreCell({
  analysis,
}: {
  analysis: ApiAnalysis | undefined;
}) {
  if (!analysis) {
    return (
      <td className="align-top px-5 py-4 border-t border-l border-line">
        <span className="text-[12px] text-muted">—</span>
      </td>
    );
  }
  const color = bandColor(analysis.risk_band);
  const label = riskLabel(analysis.risk_score);
  return (
    <td className="align-top px-5 py-4 border-t border-l border-line">
      <div className="flex items-baseline gap-1.5">
        <span
          className="text-[18px] font-bold leading-none tracking-tight"
          style={{ color }}
        >
          {label}
        </span>
        <span className="text-[11px] text-muted tabular-nums">
          ({analysis.risk_score}/100)
        </span>
      </div>
      <div
        className="mt-1 text-[10px] uppercase tracking-wider font-bold"
        style={{ color }}
      >
        ● {analysis.risk_band} band
      </div>
    </td>
  );
}

function riskLabel(score: number): string {
  if (score === 0) return "None";
  if (score < 20) return "Minimal";
  if (score < 40) return "Low";
  if (score < 60) return "Moderate";
  if (score < 80) return "High";
  return "Severe";
}

function DiscrepancyCell({
  analysis,
}: {
  analysis: ApiAnalysis | undefined;
}) {
  if (!analysis) {
    return (
      <td className="align-top px-5 py-4 border-t border-l border-line">
        <span className="text-[12px] text-muted">—</span>
      </td>
    );
  }
  const total = analysis.discrepancies.length;
  if (total === 0) {
    return (
      <td className="align-top px-5 py-4 border-t border-l border-line">
        <span className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#0F9D58]">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" fill="#0F9D58" opacity="0.15" />
            <path
              d="M8 12.5l2.5 2.5L16 9"
              stroke="#0F9D58"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          All clear
        </span>
      </td>
    );
  }
  const highCount = analysis.discrepancies.filter(
    (d) => d.severity === "high",
  ).length;
  const mediumCount = analysis.discrepancies.filter(
    (d) => d.severity === "medium",
  ).length;
  return (
    <td className="align-top px-5 py-4 border-t border-l border-line">
      <div className="text-[14px] font-semibold">
        {total} {total === 1 ? "issue" : "issues"}
      </div>
      <div className="mt-1 flex flex-wrap gap-1">
        {highCount > 0 && <SevPill sev="high" count={highCount} />}
        {mediumCount > 0 && <SevPill sev="medium" count={mediumCount} />}
        {total - highCount - mediumCount > 0 && (
          <SevPill sev="low" count={total - highCount - mediumCount} />
        )}
      </div>
    </td>
  );
}

function SevPill({
  sev,
  count,
}: {
  sev: ApiDiscrepancy["severity"];
  count: number;
}) {
  const styles = {
    high: "bg-[#FCE8E6] text-[#C5221F] border-[#F9C2CB]",
    medium: "bg-[#FEF7E0] text-[#B06000] border-[#FAD28B]",
    low: "bg-[#E6F4EA] text-[#137333] border-[#CEEAD6]",
  }[sev];
  return (
    <span
      className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${styles}`}
    >
      {count} {sev}
    </span>
  );
}

function TopIssueCell({
  analysis,
}: {
  analysis: ApiAnalysis | undefined;
}) {
  if (!analysis) {
    return (
      <td className="align-top px-5 py-4 border-t border-l border-line">
        <span className="text-[12px] text-muted">—</span>
      </td>
    );
  }
  if (analysis.discrepancies.length === 0) {
    return (
      <td className="align-top px-5 py-4 border-t border-l border-line">
        <span className="text-[12px] text-muted">No issues flagged</span>
      </td>
    );
  }
  const top = [...analysis.discrepancies].sort((a, b) => {
    const order = { high: 0, medium: 1, low: 2 };
    return order[a.severity] - order[b.severity];
  })[0];
  return (
    <td className="align-top px-5 py-4 border-t border-l border-line">
      <div className="text-[13px] font-semibold leading-snug line-clamp-2">
        {top.title}
      </div>
      <div className="mt-1 text-[11px] text-muted line-clamp-2">
        {top.detail}
      </div>
    </td>
  );
}

function SuggestedFixCell({
  analysis,
}: {
  analysis: ApiAnalysis | undefined;
}) {
  if (!analysis) {
    return (
      <td className="align-top px-5 py-4 border-t border-l border-line">
        <span className="text-[12px] text-muted">—</span>
      </td>
    );
  }
  const top = [...analysis.discrepancies]
    .sort((a, b) => {
      const order = { high: 0, medium: 1, low: 2 };
      return order[a.severity] - order[b.severity];
    })
    .find((d) => d.suggested_action.trim().length > 0);
  if (!top) {
    return (
      <td className="align-top px-5 py-4 border-t border-l border-line">
        <span className="text-[12px] text-muted">No action needed</span>
      </td>
    );
  }
  return (
    <td className="align-top px-5 py-4 border-t border-l border-line">
      <div className="text-[12px] leading-relaxed line-clamp-3">
        {top.suggested_action}
      </div>
    </td>
  );
}

function EmptyState({
  title,
  body,
  ctaHref,
  ctaLabel,
}: {
  title: string;
  body: string;
  ctaHref: string;
  ctaLabel: string;
}) {
  return (
    <div className="border border-dashed border-line bg-white px-12 py-16 text-center">
      <h2 className="text-[20px] font-semibold tracking-tight">{title}</h2>
      <p className="mt-1.5 text-[14px] text-muted max-w-md mx-auto">{body}</p>
      <Link
        href={ctaHref}
        className="mt-6 inline-flex items-center gap-2 rounded-lg bg-brand hover:bg-brand-hover px-5 py-2.5 text-[14px] font-semibold text-white"
      >
        {ctaLabel}
      </Link>
    </div>
  );
}

