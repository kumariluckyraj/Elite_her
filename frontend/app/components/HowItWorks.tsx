const steps = [
  {
    n: "01",
    title: "Upload your policy",
    body: "Drop your 40-page policy PDF. Our parser extracts sum insured, sub-limits, waiting periods, and exclusions into a canonical schema in under 30 seconds.",
  },
  {
    n: "02",
    title: "Share claim context",
    body: "Add discharge summary, hospital estimate, or prescription. We map diagnoses to ICD-10 codes and procedures to CPT — flagging missing pre-auth or documentation gaps.",
  },
  {
    n: "03",
    title: "Get your rescue plan",
    body: "A rejection probability score, the top 3 specific reasons tied to clauses, and a prioritized checklist of fixes — with ready-to-send templates for your doctor or hospital.",
  },
];

export default function HowItWorks() {
  return (
    <section
      id="how"
      className="border-b border-[color:var(--color-line)] bg-[color:var(--color-surface)]"
    >
      <div className="max-w-[1280px] mx-auto px-6 md:px-10 py-20 md:py-24">
        <div className="grid md:grid-cols-12 gap-10">
          <div className="md:col-span-5">
            <div className="text-[13px] font-semibold uppercase tracking-[0.08em] text-[color:var(--color-brand)] mb-4">
              How it works
            </div>
            <h2 className="text-[32px] md:text-[44px] font-semibold leading-[1.1] tracking-[-0.02em] text-[color:var(--color-ink)]">
              From policy PDF to rescue plan in under 60 seconds.
            </h2>
            <p className="mt-5 text-[16px] text-[color:var(--color-muted)] max-w-[420px]">
              No insurance jargon, no legal reading. Just actionable steps
              traced back to the exact clause in your policy.
            </p>
          </div>

          <ol className="md:col-span-7 border-t border-[color:var(--color-line)]">
            {steps.map((s) => (
              <li
                key={s.n}
                className="grid grid-cols-[auto_1fr] gap-6 md:gap-10 border-b border-[color:var(--color-line)] py-8"
              >
                <div className="text-[14px] font-semibold text-[color:var(--color-brand)] tabular-nums">
                  {s.n}
                </div>
                <div>
                  <div className="text-[20px] font-semibold text-[color:var(--color-ink)]">
                    {s.title}
                  </div>
                  <p className="mt-2 text-[15px] leading-[1.6] text-[color:var(--color-muted)]">
                    {s.body}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
