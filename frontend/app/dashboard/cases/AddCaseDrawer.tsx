"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CASE_DOC_TYPES, findInsurer } from "@/lib/insurers";
import type { PolicyOption } from "./CasesClient";

export default function AddCaseDrawer({
  policies,
  onClose,
}: {
  policies: PolicyOption[];
  onClose: () => void;
}) {
  const router = useRouter();
  const [policyId, setPolicyId] = useState<string>(
    policies[0]?.id?.toString() ?? "",
  );
  const [patientName, setPatientName] = useState("");
  const [hospital, setHospital] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [admissionDate, setAdmissionDate] = useState("");
  const [filesByType, setFilesByType] = useState<Record<string, File[]>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  function setFiles(typeId: string, files: FileList | null) {
    setFilesByType((prev) => ({
      ...prev,
      [typeId]: files ? Array.from(files) : [],
    }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!policyId) {
      setError("Select a policy");
      return;
    }
    if (!patientName.trim()) {
      setError("Patient name is required");
      return;
    }
    if (
      !filesByType.discharge_summary?.length ||
      !filesByType.hospital_bill?.length
    ) {
      setError("Discharge summary and hospital bill are required");
      return;
    }

    const fd = new FormData();
    fd.append("policy_id", policyId);
    fd.append("patient_name", patientName);
    if (hospital) fd.append("hospital", hospital);
    if (diagnosis) fd.append("diagnosis", diagnosis);
    if (admissionDate) fd.append("admission_date", admissionDate);

    for (const [typeId, files] of Object.entries(filesByType)) {
      for (const f of files) fd.append(`doc_${typeId}`, f);
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/cases", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Upload failed");
        return;
      }
      const created = data.case;
      router.push(`/dashboard/cases/${created.id}`);
    } catch {
      setError("Network error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <div className="relative ml-auto w-full max-w-lg bg-white h-full shadow-xl overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-[color:var(--color-line)] px-6 py-4 flex items-center justify-between">
          <h2 className="text-[18px] font-semibold tracking-tight">
            Add a case
          </h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="text-[color:var(--color-muted)] hover:text-[color:var(--color-ink)]"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M6 6l12 12M18 6l-12 12"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        <form onSubmit={onSubmit} className="px-6 py-5 space-y-5">
          <Field label="Policy" required>
            <select
              required
              value={policyId}
              onChange={(e) => setPolicyId(e.target.value)}
              className="w-full rounded-lg border border-[color:var(--color-line)] px-3.5 py-2.5 text-[14px] bg-white focus:outline-none focus:ring-2 focus:ring-[color:var(--color-brand)] focus:border-transparent"
            >
              {policies.map((p) => {
                const insurer = findInsurer(p.insurer);
                const label = p.policy_name
                  ? `${insurer?.short ?? p.insurer} — ${p.policy_name}`
                  : (insurer?.name ?? p.insurer);
                return (
                  <option key={p.id} value={p.id}>
                    {label}
                  </option>
                );
              })}
            </select>
          </Field>

          <Field label="Patient name" required>
            <input
              type="text"
              required
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              placeholder="Full name"
              className="w-full rounded-lg border border-[color:var(--color-line)] px-3.5 py-2.5 text-[14px] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-brand)] focus:border-transparent"
            />
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Hospital">
              <input
                type="text"
                value={hospital}
                onChange={(e) => setHospital(e.target.value)}
                placeholder="Apollo Hospitals, Chennai"
                className="w-full rounded-lg border border-[color:var(--color-line)] px-3.5 py-2.5 text-[14px] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-brand)] focus:border-transparent"
              />
            </Field>
            <Field label="Admission date">
              <input
                type="date"
                value={admissionDate}
                onChange={(e) => setAdmissionDate(e.target.value)}
                className="w-full rounded-lg border border-[color:var(--color-line)] px-3.5 py-2.5 text-[14px] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-brand)] focus:border-transparent"
              />
            </Field>
          </div>

          <Field label="Diagnosis">
            <input
              type="text"
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              placeholder="e.g. Acute appendicitis"
              className="w-full rounded-lg border border-[color:var(--color-line)] px-3.5 py-2.5 text-[14px] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-brand)] focus:border-transparent"
            />
          </Field>

          <div className="pt-2">
            <h3 className="text-[14px] font-semibold mb-2">Hospital documents</h3>
            <div className="space-y-3">
              {CASE_DOC_TYPES.map((dt) => (
                <FileSlot
                  key={dt.id}
                  label={dt.label}
                  required={dt.required}
                  files={filesByType[dt.id] ?? []}
                  onChange={(files) => setFiles(dt.id, files)}
                />
              ))}
            </div>
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-3.5 py-2.5 text-[13px] text-red-700">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-[color:var(--color-line)] px-4 py-2.5 text-[14px] font-medium hover:bg-[color:var(--color-surface)]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 rounded-lg bg-[color:var(--color-brand)] hover:bg-[color:var(--color-brand-hover)] disabled:opacity-60 px-4 py-2.5 text-[14px] font-semibold text-white"
            >
              {submitting ? "Uploading…" : "Save case"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-[13px] font-medium mb-1.5">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </span>
      {children}
    </label>
  );
}

function FileSlot({
  label,
  required,
  files,
  onChange,
}: {
  label: string;
  required?: boolean;
  files: File[];
  onChange: (files: FileList | null) => void;
}) {
  const id = `case-slot-${label.replace(/\s+/g, "-").toLowerCase()}`;
  return (
    <div className="border border-dashed border-[color:var(--color-line)] rounded-lg p-3 hover:border-[color:var(--color-brand)] transition-colors">
      <label
        htmlFor={id}
        className="flex items-center justify-between cursor-pointer"
      >
        <div>
          <div className="text-[13px] font-medium">
            {label}
            {required && <span className="text-red-500 ml-0.5">*</span>}
          </div>
          {files.length > 0 ? (
            <div className="mt-1 text-[12px] text-[color:var(--color-brand)]">
              {files.map((f) => f.name).join(", ")}
            </div>
          ) : (
            <div className="mt-0.5 text-[12px] text-[color:var(--color-muted)]">
              PDF, JPG, PNG (multiple allowed)
            </div>
          )}
        </div>
        <span className="text-[13px] font-medium text-[color:var(--color-brand)] whitespace-nowrap">
          {files.length > 0 ? "Replace" : "Choose files"}
        </span>
      </label>
      <input
        id={id}
        type="file"
        multiple
        accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/*"
        onChange={(e) => onChange(e.target.files)}
        className="hidden"
      />
    </div>
  );
}
