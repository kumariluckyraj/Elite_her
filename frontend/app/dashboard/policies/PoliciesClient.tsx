"use client";

import { useState } from "react";
import { findInsurer } from "@/lib/insurers";
import type { ApiPolicy } from "@/lib/serialize";
import AddPolicyDrawer from "./AddPolicyDrawer";

export type PolicyWithDocs = ApiPolicy;

type PolicyStatus = "active" | "expiring" | "expired" | "unknown";

function policyStatus(validTill: string | null): PolicyStatus {
  if (!validTill) return "unknown";
  const due = new Date(validTill).getTime();
  if (Number.isNaN(due)) return "unknown";
  const now = Date.now();
  const diffDays = (due - now) / 86400000;
  if (diffDays < 0) return "expired";
  if (diffDays <= 60) return "expiring";
  return "active";
}

function formatINR(value: string | null): string | null {
  if (!value) return null;
  const n = Number(value.replace(/[^\d.]/g, ""));
  if (Number.isNaN(n)) return value;
  return `₹${n.toLocaleString("en-IN")}`;
}

export default function PoliciesClient({
  initial,
}: {
  initial: PolicyWithDocs[];
}) {
  const [policies, setPolicies] = useState<PolicyWithDocs[]>(initial);
  const [open, setOpen] = useState(false);

  function onAdded(policy: PolicyWithDocs) {
    setPolicies((p) => [policy, ...p]);
    setOpen(false);
  }

  async function onDelete(id: string) {
    if (!confirm("Remove this policy and all its documents?")) return;
    const res = await fetch(`/api/policies/${id}`, { method: "DELETE" });
    if (res.ok) {
      setPolicies((p) => p.filter((x) => x.id !== id));
    } else {
      const data = await res.json().catch(() => ({}));
      alert(data.error ?? "Could not delete");
    }
  }

  const total = policies.length;
  const active = policies.filter(
    (p) => policyStatus(p.valid_till) === "active",
  ).length;
  const expiringSoon = policies.filter(
    (p) => policyStatus(p.valid_till) === "expiring",
  ).length;

  return (
    <div>
      <header className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-[0.1em] text-brand">
            Coverage
          </div>
          <h1 className="mt-1.5 text-[28px] font-semibold tracking-tight">
            Policies
          </h1>
          <p className="mt-1 text-[14px] text-muted max-w-[560px]">
            Upload your health insurance policies — we&apos;ll parse the
            clauses, exclusions, and waiting periods so every claim audit runs
            against your real coverage.
          </p>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-brand hover:bg-brand-hover px-4 py-2.5 text-[14px] font-semibold text-white transition-colors shadow-sm"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 5v14M5 12h14"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          Add policy
        </button>
      </header>

      {policies.length === 0 ? (
        <EmptyState onAdd={() => setOpen(true)} />
      ) : (
        <>
          <section className="border border-line bg-white mb-6">
            <div className="grid grid-cols-3">
              <SummaryCell label="Policies" value={String(total)} />
              <SummaryCell
                label="Active"
                value={String(active)}
                accent="#0F9D58"
              />
              <SummaryCell
                label="Expiring soon"
                value={String(expiringSoon)}
                accent={expiringSoon > 0 ? "#F6A93B" : undefined}
                hint="Within 60 days"
                last
              />
            </div>
          </section>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {policies.map((p) => (
              <PolicyCard
                key={p.id}
                policy={p}
                onDelete={() => onDelete(p.id)}
              />
            ))}
          </div>
        </>
      )}

      {open && (
        <AddPolicyDrawer onClose={() => setOpen(false)} onAdded={onAdded} />
      )}
    </div>
  );
}

function SummaryCell({
  label,
  value,
  accent,
  hint,
  last,
}: {
  label: string;
  value: string;
  accent?: string;
  hint?: string;
  last?: boolean;
}) {
  return (
    <div
      className={`px-6 py-5 ${last ? "" : "border-r border-line"}`}
    >
      <div className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted">
        {label}
      </div>
      <div
        className="mt-1 text-[32px] font-bold leading-none tracking-tight"
        style={{ color: accent ?? "var(--color-ink)" }}
      >
        {value}
      </div>
      {hint && (
        <div className="mt-1.5 text-[12px] text-muted">{hint}</div>
      )}
    </div>
  );
}

function PolicyCard({
  policy,
  onDelete,
}: {
  policy: PolicyWithDocs;
  onDelete: () => void;
}) {
  const insurer = findInsurer(policy.insurer);
  const docCount = policy.documents.length;
  const created = new Date(policy.created_at).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const status = policyStatus(policy.valid_till);
  const statusMeta = {
    active: {
      label: "Active",
      bg: "bg-[#E6F4EA]",
      text: "text-[#137333]",
      border: "border-[#CEEAD6]",
      dot: "#0F9D58",
    },
    expiring: {
      label: "Expiring soon",
      bg: "bg-[#FEF7E0]",
      text: "text-[#B06000]",
      border: "border-[#FAD28B]",
      dot: "#F6A93B",
    },
    expired: {
      label: "Expired",
      bg: "bg-[#FCE8E6]",
      text: "text-[#C5221F]",
      border: "border-[#F9C2CB]",
      dot: "#E5484D",
    },
    unknown: {
      label: "No expiry set",
      bg: "bg-surface-alt",
      text: "text-muted",
      border: "border-line",
      dot: "#999",
    },
  }[status];
  const accent = insurer?.accent ?? "#666";
  const sumInsured = formatINR(policy.sum_insured);

  return (
    <article className="group relative bg-white border border-line rounded-xl overflow-hidden hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:-translate-y-0.5 transition-all duration-200">
      {/* Top accent strip in the insurer's brand color */}
      <div
        className="h-1.5 w-full"
        style={{
          background: `linear-gradient(90deg, ${accent} 0%, ${accent}99 100%)`,
        }}
      />

      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          {/* Insurer logo block (initials + tinted bg) */}
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center text-white text-[14px] font-bold shrink-0 shadow-sm"
              style={{
                background: `linear-gradient(135deg, ${accent} 0%, ${accent}d0 100%)`,
              }}
            >
              {(insurer?.short ?? policy.insurer).slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0">
              <h3 className="text-[15px] font-semibold leading-tight truncate">
                {policy.policy_name ?? insurer?.short ?? "Policy"}
              </h3>
              <p className="text-[12px] text-muted mt-0.5 truncate">
                {insurer?.name ?? policy.insurer}
              </p>
            </div>
          </div>

          <button
            onClick={onDelete}
            aria-label="Delete policy"
            className="opacity-0 group-hover:opacity-100 text-muted hover:text-red-600 hover:bg-red-50 w-8 h-8 rounded-lg inline-flex items-center justify-center transition-all"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
              <path
                d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14z"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        {/* Status pill */}
        <span
          className={`mt-4 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-[0.06em] border ${statusMeta.bg} ${statusMeta.text} ${statusMeta.border}`}
        >
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: statusMeta.dot }}
          />
          {statusMeta.label}
        </span>

        {/* Highlight: sum insured */}
        {sumInsured && (
          <div className="mt-4 px-4 py-3 rounded-lg bg-surface border border-line">
            <div className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted">
              Sum insured
            </div>
            <div className="mt-0.5 text-[20px] font-bold leading-none tracking-tight">
              {sumInsured}
            </div>
          </div>
        )}

        {/* Detail rows */}
        <dl className="mt-4 space-y-2 text-[13px]">
          {policy.policy_number && (
            <div className="flex justify-between gap-2">
              <dt className="text-muted">Policy no.</dt>
              <dd className="font-medium truncate">{policy.policy_number}</dd>
            </div>
          )}
          {policy.valid_till && (
            <div className="flex justify-between gap-2">
              <dt className="text-muted">Valid till</dt>
              <dd className="font-medium">{policy.valid_till}</dd>
            </div>
          )}
        </dl>

        <div className="mt-5 pt-4 border-t border-line flex items-center justify-between text-[12px] text-muted">
          <span className="inline-flex items-center gap-1.5">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
              <path
                d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <polyline
                points="14 2 14 8 20 8"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </svg>
            {docCount} document{docCount === 1 ? "" : "s"}
          </span>
          <span>Added {created}</span>
        </div>
      </div>
    </article>
  );
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="bg-white border border-dashed border-line rounded-xl p-12 text-center">
      <div className="mx-auto w-14 h-14 rounded-2xl bg-brand-subtle flex items-center justify-center mb-5">
        <svg
          width="26"
          height="26"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--color-brand)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
          <polyline points="14 2 14 8 20 8" />
        </svg>
      </div>
      <h2 className="text-[20px] font-semibold tracking-tight">
        No policies yet
      </h2>
      <p className="mt-1.5 text-[14px] text-muted max-w-md mx-auto">
        Add your first health insurance policy to start auditing claims against
        your real coverage.
      </p>
      <button
        onClick={onAdd}
        className="mt-6 inline-flex items-center gap-2 rounded-lg bg-brand hover:bg-brand-hover px-5 py-2.5 text-[14px] font-semibold text-white transition-colors shadow-sm"
      >
        Add your first policy
      </button>
    </div>
  );
}
