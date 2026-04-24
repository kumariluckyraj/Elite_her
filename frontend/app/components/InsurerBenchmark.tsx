const rows = [
  {
    insurer: "Star Health",
    settled: "71%",
    complaints: "13,308",
    avgDays: "9.4 days",
    trend: "down",
  },
  {
    insurer: "HDFC Ergo",
    settled: "94%",
    complaints: "2,104",
    avgDays: "4.2 days",
    trend: "up",
  },
  {
    insurer: "ICICI Lombard",
    settled: "88%",
    complaints: "3,870",
    avgDays: "5.8 days",
    trend: "flat",
  },
  {
    insurer: "Niva Bupa",
    settled: "85%",
    complaints: "2,921",
    avgDays: "6.1 days",
    trend: "up",
  },
  {
    insurer: "Care Health",
    settled: "79%",
    complaints: "4,560",
    avgDays: "7.3 days",
    trend: "down",
  },
];

export default function InsurerBenchmark() {
  return (
    <section
      id="insurers"
      className="border-b border-[color:var(--color-line)] bg-[color:var(--color-surface)]"
    >
      <div className="max-w-[1280px] mx-auto px-6 md:px-10 py-20 md:py-24">
        <div className="grid md:grid-cols-12 gap-10 items-end mb-10">
          <div className="md:col-span-7">
            <div className="text-[13px] font-semibold uppercase tracking-[0.08em] text-[color:var(--color-brand)] mb-4">
              Insurer benchmarking
            </div>
            <h2 className="text-[32px] md:text-[44px] font-semibold leading-[1.1] tracking-[-0.02em] text-[color:var(--color-ink)]">
              Every insurer behaves differently. Now you can see it.
            </h2>
          </div>
          <p className="md:col-span-5 text-[15px] text-[color:var(--color-muted)]">
            Settlement ratios, ombudsman complaints, and claim-type-specific
            behavior for the top Indian health insurers — updated from public
            IRDAI disclosures.
          </p>
        </div>

        <div className="border border-[color:var(--color-line)] bg-white overflow-hidden">
          <div className="grid grid-cols-[2fr_1fr_1fr_1fr_0.6fr] bg-white border-b border-[color:var(--color-line)] text-[12px] font-semibold uppercase tracking-[0.08em] text-[color:var(--color-muted)]">
            <div className="px-6 py-4">Insurer</div>
            <div className="px-6 py-4">Settlement</div>
            <div className="px-6 py-4">Complaints</div>
            <div className="px-6 py-4">Avg time</div>
            <div className="px-6 py-4 text-right">Trend</div>
          </div>
          {rows.map((r, i) => (
            <div
              key={r.insurer}
              className={`grid grid-cols-[2fr_1fr_1fr_1fr_0.6fr] items-center text-[14px] ${
                i < rows.length - 1
                  ? "border-b border-[color:var(--color-line)]"
                  : ""
              } hover:bg-[color:var(--color-surface)] transition-colors`}
            >
              <div className="px-6 py-5 font-semibold text-[color:var(--color-ink)]">
                {r.insurer}
              </div>
              <div className="px-6 py-5 text-[color:var(--color-ink)]">
                {r.settled}
              </div>
              <div className="px-6 py-5 text-[color:var(--color-muted)]">
                {r.complaints}
              </div>
              <div className="px-6 py-5 text-[color:var(--color-muted)]">
                {r.avgDays}
              </div>
              <div className="px-6 py-5 text-right">
                <TrendIcon trend={r.trend} />
              </div>
            </div>
          ))}
        </div>

        <p className="mt-6 text-[13px] text-[color:var(--color-muted)]">
          Figures illustrative — live dashboard uses IRDAI annual report +
          ombudsman public rulings.
        </p>
      </div>
    </section>
  );
}

function TrendIcon({ trend }: { trend: string }) {
  if (trend === "up")
    return <span className="text-[color:var(--color-success)]">↗</span>;
  if (trend === "down") return <span className="text-[#E5484D]">↘</span>;
  return <span className="text-[color:var(--color-muted)]">→</span>;
}
