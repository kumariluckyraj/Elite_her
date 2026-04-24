const features = [
  {
    title: "Policy Intelligence Engine",
    body: "Extracts sum insured, sub-limits, waiting periods, and permanent exclusions from any top-15 Indian insurer's policy — versioned by year.",
    icon: "doc",
  },
  {
    title: "Rejection Probability Score",
    body: "Rule-engine deterministic checks plus LLM reasoning, weighted by your insurer's historical rejection patterns. Every prediction cites a specific clause.",
    icon: "gauge",
  },
  {
    title: "Corrective Action Plan",
    body: "Specific fixes ranked by approval-lift impact — with ready-to-send templates for your doctor, hospital billing desk, or insurer.",
    icon: "list",
  },
  {
    title: "Insurer Benchmarking",
    body: "See your insurer's real settlement ratio, ombudsman complaint volume, and behavior on claims like yours. Set expectations with data.",
    icon: "chart",
  },
  {
    title: "Appeal Letter Generator",
    body: "Already rejected? We pull matching ombudsman precedents and draft a rebuttal citing the IRDAI regulations the insurer violated.",
    icon: "letter",
  },
  {
    title: "DPDP-Compliant by Design",
    body: "Explicit consent flows, encryption at rest and in transit, data minimization, zero insurer data-sharing. Your health records stay yours.",
    icon: "shield",
  },
];

export default function Features() {
  return (
    <section
      id="features"
      className="border-b border-[color:var(--color-line)]"
    >
      <div className="max-w-[1280px] mx-auto px-6 md:px-10 py-20 md:py-24">
        <div className="max-w-[720px] mb-14">
          <div className="text-[13px] font-semibold uppercase tracking-[0.08em] text-[color:var(--color-brand)] mb-4">
            What&apos;s inside
          </div>
          <h2 className="text-[32px] md:text-[44px] font-semibold leading-[1.1] tracking-[-0.02em] text-[color:var(--color-ink)]">
            Everything you need to flip the information asymmetry.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 border-l border-t border-[color:var(--color-line)]">
          {features.map((f) => (
            <div
              key={f.title}
              className="border-r border-b border-[color:var(--color-line)] p-8 bg-white group hover:bg-[color:var(--color-surface)] transition-colors"
            >
              <FeatureIcon kind={f.icon} />
              <h3 className="mt-5 text-[18px] font-semibold text-[color:var(--color-ink)]">
                {f.title}
              </h3>
              <p className="mt-2 text-[14px] leading-[1.65] text-[color:var(--color-muted)]">
                {f.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeatureIcon({ kind }: { kind: string }) {
  const common = {
    width: 24,
    height: 24,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "var(--color-brand)",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  const box = (
    <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[color:var(--color-brand-subtle)]">
      {kind === "doc" && (
        <svg {...common}>
          <path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9l-6-6z" />
          <path d="M14 3v6h6M8 13h8M8 17h6" />
        </svg>
      )}
      {kind === "gauge" && (
        <svg {...common}>
          <path d="M12 14l4-4M20 12a8 8 0 1 0-16 0" />
          <circle cx="12" cy="14" r="1.2" fill="var(--color-brand)" />
        </svg>
      )}
      {kind === "list" && (
        <svg {...common}>
          <path d="M9 6h11M9 12h11M9 18h11" />
          <path d="M4 6l1 1 2-2M4 12l1 1 2-2M4 18l1 1 2-2" />
        </svg>
      )}
      {kind === "chart" && (
        <svg {...common}>
          <path d="M3 3v18h18" />
          <path d="M7 14l4-4 3 3 5-6" />
        </svg>
      )}
      {kind === "letter" && (
        <svg {...common}>
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="M3 7l9 6 9-6" />
        </svg>
      )}
      {kind === "shield" && (
        <svg {...common}>
          <path d="M12 3l8 3v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6l8-3z" />
          <path d="M9 12l2 2 4-4" />
        </svg>
      )}
    </div>
  );
  return box;
}
