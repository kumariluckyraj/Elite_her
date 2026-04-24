const stats = [
  {
    value: "₹26,037",
    suffix: "Cr",
    label: "Claims rejected in FY24",
    sub: "Up 19.1% year over year — an industry-wide crisis.",
  },
  {
    value: "50",
    suffix: "%+",
    label: "Claimants face rejection",
    sub: "Half of all policyholders hit partial or full rejection.",
  },
  {
    value: "36",
    suffix: "%",
    label: "Policy T&C mismatches",
    sub: "The single largest rejection reason — and the most preventable.",
  },
  {
    value: "13,308",
    suffix: "",
    label: "Ombudsman complaints",
    sub: "Against one insurer alone. Most never get filed.",
  },
];

export default function Stats() {
  return (
    <section className="border-b border-[color:var(--color-line)] bg-white">
      <div className="max-w-[1280px] mx-auto px-6 md:px-10 py-16 md:py-20">
        <div className="max-w-[720px] mb-12">
          <div className="text-[13px] font-semibold uppercase tracking-[0.08em] text-[color:var(--color-brand)] mb-4">
            The rejection crisis
          </div>
          <h2 className="text-[32px] md:text-[44px] font-semibold leading-[1.1] tracking-[-0.02em] text-[color:var(--color-ink)]">
            Indian health insurance rejects one claim in two. Nobody warned you
            why.
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border-l border-t border-[color:var(--color-line)]">
          {stats.map((s) => (
            <div
              key={s.label}
              className="border-r border-b border-[color:var(--color-line)] p-6 md:p-8 bg-white"
            >
              <div className="flex items-baseline gap-1">
                <span className="text-[40px] md:text-[48px] font-semibold leading-none tracking-[-0.02em] text-[color:var(--color-ink)]">
                  {s.value}
                </span>
                <span className="text-[24px] font-semibold text-[color:var(--color-ink)]">
                  {s.suffix}
                </span>
              </div>
              <div className="mt-3 text-[15px] font-semibold text-[color:var(--color-ink)]">
                {s.label}
              </div>
              <div className="mt-1 text-[13px] leading-[1.5] text-[color:var(--color-muted)]">
                {s.sub}
              </div>
            </div>
          ))}
        </div>

        <p className="mt-8 text-[13px] text-[color:var(--color-muted)]">
          Source: IRDAI, LocalCircles 2026, Statista.
        </p>
      </div>
    </section>
  );
}
