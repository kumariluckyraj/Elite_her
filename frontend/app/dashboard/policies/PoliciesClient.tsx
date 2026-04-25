"use client";

import { useState } from "react";
import { findInsurer } from "@/lib/insurers";
import type { ApiPolicy } from "@/lib/serialize";
import AddPolicyDrawer from "./AddPolicyDrawer";

export type PolicyWithDocs = ApiPolicy;

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

  return (
    <div>
      <div className="flex items-end justify-between mb-6">
        <div>
          <h1 className="text-[28px] font-semibold tracking-tight">Policies</h1>
          <p className="mt-1 text-[14px] text-[color:var(--color-muted)]">
            Upload your health insurance policies — we&apos;ll parse the
            clauses, exclusions, and waiting periods.
          </p>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-[color:var(--color-brand)] hover:bg-[color:var(--color-brand-hover)] px-4 py-2.5 text-[14px] font-semibold text-white transition-colors"
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
      </div>

      {policies.length === 0 ? (
        <EmptyState onAdd={() => setOpen(true)} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {policies.map((p) => (
            <PolicyCard key={p.id} policy={p} onDelete={() => onDelete(p.id)} />
          ))}
        </div>
      )}

      {open && (
        <AddPolicyDrawer onClose={() => setOpen(false)} onAdded={onAdded} />
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

  return (
    <div className="bg-white border border-[color:var(--color-line)] rounded-xl p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-[14px] font-bold"
          style={{ backgroundColor: insurer?.accent ?? "#666" }}
        >
          {insurer?.short.slice(0, 2).toUpperCase() ?? "??"}
        </div>
        <button
          onClick={onDelete}
          aria-label="Delete policy"
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
        {policy.policy_name ?? insurer?.short ?? "Policy"}
      </h3>
      <p className="text-[13px] text-[color:var(--color-muted)] mt-0.5">
        {insurer?.name ?? policy.insurer}
      </p>

      <dl className="mt-4 space-y-1.5 text-[13px]">
        {policy.policy_number && (
          <div className="flex justify-between">
            <dt className="text-[color:var(--color-muted)]">Policy no.</dt>
            <dd className="font-medium truncate ml-2">{policy.policy_number}</dd>
          </div>
        )}
        {policy.sum_insured && (
          <div className="flex justify-between">
            <dt className="text-[color:var(--color-muted)]">Sum insured</dt>
            <dd className="font-medium">₹{policy.sum_insured}</dd>
          </div>
        )}
        {policy.valid_till && (
          <div className="flex justify-between">
            <dt className="text-[color:var(--color-muted)]">Valid till</dt>
            <dd className="font-medium">{policy.valid_till}</dd>
          </div>
        )}
      </dl>

      <div className="mt-4 pt-4 border-t border-[color:var(--color-line)] flex items-center justify-between text-[12px] text-[color:var(--color-muted)]">
        <span>
          {docCount} document{docCount === 1 ? "" : "s"}
        </span>
        <span>Added {created}</span>
      </div>
    </div>
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
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
          <polyline points="14 2 14 8 20 8" />
        </svg>
      </div>
      <h2 className="text-[18px] font-semibold">No policies yet</h2>
      <p className="mt-1 text-[14px] text-[color:var(--color-muted)] max-w-md mx-auto">
        Add your first health insurance policy to start auditing claims against
        your real coverage.
      </p>
      <button
        onClick={onAdd}
        className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[color:var(--color-brand)] hover:bg-[color:var(--color-brand-hover)] px-4 py-2.5 text-[14px] font-semibold text-white transition-colors"
      >
        Add your first policy
      </button>
    </div>
  );
}
