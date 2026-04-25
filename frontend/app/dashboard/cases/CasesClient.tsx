"use client";

import Link from "next/link";
import { useState } from "react";
import { findInsurer } from "@/lib/insurers";
import type { ApiCase } from "@/lib/serialize";
import AddCaseDrawer from "./AddCaseDrawer";

export type PolicyOption = {
  id: string;
  insurer: string;
  policy_name: string | null;
};

export type CaseWithDocs = ApiCase;

export default function CasesClient({
  initial,
  policies,
}: {
  initial: CaseWithDocs[];
  policies: PolicyOption[];
}) {
  const [cases, setCases] = useState<CaseWithDocs[]>(initial);
  const [open, setOpen] = useState(false);

  async function onDelete(id: string) {
    if (!confirm("Remove this case and all its documents?")) return;
    const res = await fetch(`/api/cases/${id}`, { method: "DELETE" });
    if (res.ok) {
      setCases((c) => c.filter((x) => x.id !== id));
    } else {
      const data = await res.json().catch(() => ({}));
      alert(data.error ?? "Could not delete");
    }
  }

  const noPolicies = policies.length === 0;

  return (
    <div>
      <div className="flex items-end justify-between mb-6">
        <div>
          <h1 className="text-[28px] font-semibold tracking-tight">Cases</h1>
          <p className="mt-1 text-[14px] text-[color:var(--color-muted)]">
            Add a hospital case — discharge summary, bills, reports — and
            we&apos;ll predict its rejection risk against your policy.
          </p>
        </div>
        <button
          onClick={() => setOpen(true)}
          disabled={noPolicies}
          className="inline-flex items-center gap-2 rounded-lg bg-[color:var(--color-brand)] hover:bg-[color:var(--color-brand-hover)] disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2.5 text-[14px] font-semibold text-white transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 5v14M5 12h14"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          Add case
        </button>
      </div>

      {noPolicies ? (
        <NoPoliciesState />
      ) : cases.length === 0 ? (
        <EmptyState onAdd={() => setOpen(true)} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {cases.map((c) => (
            <CaseCard key={c.id} item={c} onDelete={() => onDelete(c.id)} />
          ))}
        </div>
      )}

      {open && !noPolicies && (
        <AddCaseDrawer
          policies={policies}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  );
}

function CaseCard({
  item,
  onDelete,
}: {
  item: CaseWithDocs;
  onDelete: () => void;
}) {
  const insurer = item.policy ? findInsurer(item.policy.insurer) : undefined;
  const docCount = item.documents.length;
  const created = new Date(item.created_at).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const risk = item.risk_score ?? "pending";
  const riskColor =
    risk === "green"
      ? "bg-[#E6F4EA] text-[#137333] border border-[#CEEAD6]"
      : risk === "yellow"
        ? "bg-[#FEF7E0] text-[#B06000] border border-[#FAD28B]"
        : risk === "red"
          ? "bg-[#FCE8E6] text-[#C5221F] border border-[#F9C2CB]"
          : "bg-[color:var(--color-surface-alt)] text-[color:var(--color-muted)] border border-[color:var(--color-line)]";
  const riskLabel =
    risk === "pending" ? "Awaiting analysis" : risk.toUpperCase();

  return (
    <Link
      href={`/dashboard/cases/${item.id}`}
      className="block bg-white border border-[color:var(--color-line)] rounded-xl p-5 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:border-[color:var(--color-brand-subtle)] transition-all duration-300"
    >
      <div className="flex items-start justify-between mb-4">
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase ${riskColor}`}
        >
          {risk !== "pending" && (
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: "currentColor" }}
            />
          )}
          {riskLabel}
        </span>
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onDelete();
          }}
          aria-label="Delete case"
          className="text-[color:var(--color-muted)] hover:text-red-600 transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path
              d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>

      <h3 className="text-[16px] font-semibold leading-tight">
        {item.patient_name}
      </h3>
      {item.diagnosis && (
        <p className="text-[13px] text-[color:var(--color-muted)] mt-0.5">
          {item.diagnosis}
        </p>
      )}

      <dl className="mt-4 space-y-1.5 text-[13px]">
        {item.hospital && (
          <div className="flex justify-between">
            <dt className="text-[color:var(--color-muted)]">Hospital</dt>
            <dd className="font-medium truncate ml-2">{item.hospital}</dd>
          </div>
        )}
        {item.admission_date && (
          <div className="flex justify-between">
            <dt className="text-[color:var(--color-muted)]">Admitted</dt>
            <dd className="font-medium">{item.admission_date}</dd>
          </div>
        )}
        {insurer && (
          <div className="flex justify-between">
            <dt className="text-[color:var(--color-muted)]">Policy</dt>
            <dd className="font-medium truncate ml-2 flex items-center gap-1.5">
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: insurer.accent }}
              />
              {insurer.short}
            </dd>
          </div>
        )}
      </dl>

      <div className="mt-4 pt-4 border-t border-[color:var(--color-line)] flex items-center justify-between text-[12px] text-[color:var(--color-muted)]">
        <span>
          {docCount} document{docCount === 1 ? "" : "s"}
        </span>
        <span>Added {created}</span>
      </div>
    </Link>
  );
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="bg-white border border-dashed border-[color:var(--color-line)] rounded-xl p-12 text-center">
      <div className="mx-auto w-12 h-12 rounded-full bg-[color:var(--color-brand-subtle)] flex items-center justify-center mb-4">
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--color-brand)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0016.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 002 8.5c0 2.29 1.51 4.04 3 5.5l7 7 7-7z" />
        </svg>
      </div>
      <h2 className="text-[18px] font-semibold">No cases yet</h2>
      <p className="mt-1 text-[14px] text-[color:var(--color-muted)] max-w-md mx-auto">
        Add a hospitalization case with discharge summary, bills, and
        prescriptions to predict its claim outcome.
      </p>
      <button
        onClick={onAdd}
        className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[color:var(--color-brand)] hover:bg-[color:var(--color-brand-hover)] px-4 py-2.5 text-[14px] font-semibold text-white"
      >
        Add your first case
      </button>
    </div>
  );
}

function NoPoliciesState() {
  return (
    <div className="bg-white border border-dashed border-[color:var(--color-line)] rounded-xl p-12 text-center">
      <div className="mx-auto w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center mb-4">
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#A16207"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01" />
        </svg>
      </div>
      <h2 className="text-[18px] font-semibold">Add a policy first</h2>
      <p className="mt-1 text-[14px] text-[color:var(--color-muted)] max-w-md mx-auto">
        Cases are evaluated against your policy&apos;s coverage. Upload at
        least one policy before adding cases.
      </p>
      <Link
        href="/dashboard/policies"
        className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[color:var(--color-brand)] hover:bg-[color:var(--color-brand-hover)] px-4 py-2.5 text-[14px] font-semibold text-white"
      >
        Go to Policies
      </Link>
    </div>
  );
}
