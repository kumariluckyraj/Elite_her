const tiers = [
  {
    name: "Free",
    price: "₹0",
    cadence: "forever",
    tagline: "Understand what your policy actually covers.",
    features: [
      "Plain-English policy summary",
      "1 basic risk check per month",
      "Insurer benchmark view",
    ],
    cta: "Start free",
    highlight: false,
  },
  {
    name: "Pro",
    price: "₹499",
    cadence: "per claim",
    tagline: "Full pre-claim audit with a fix-it plan.",
    features: [
      "Full rejection probability report",
      "Prioritized action plan with templates",
      "Appeal letter generator",
      "Priority email support",
    ],
    cta: "Audit my claim",
    highlight: true,
  },
  {
    name: "Annual",
    price: "₹1,499",
    cadence: "per year",
    tagline: "Peace of mind for the whole family floater.",
    features: [
      "Unlimited audits for 1 year",
      "Priority human review",
      "Ombudsman case law access",
      "Lawyer marketplace (coming soon)",
    ],
    cta: "Get Annual",
    highlight: false,
  },
];

export default function Pricing() {
  return (
    <section
      id="pricing"
      className="border-b border-[color:var(--color-line)]"
    >
      <div className="max-w-[1280px] mx-auto px-6 md:px-10 py-20 md:py-24">
        <div className="max-w-[720px] mb-14">
          <div className="text-[13px] font-semibold uppercase tracking-[0.08em] text-[color:var(--color-brand)] mb-4">
            Pricing
          </div>
          <h2 className="text-[32px] md:text-[44px] font-semibold leading-[1.1] tracking-[-0.02em] text-[color:var(--color-ink)]">
            Pay once per claim. Or protect the whole year.
          </h2>
          <p className="mt-4 text-[16px] text-[color:var(--color-muted)]">
            No insurer pays us. You do. That&apos;s how we stay on your side.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 border-l border-t border-[color:var(--color-line)]">
          {tiers.map((t) => (
            <div
              key={t.name}
              className={`relative border-r border-b border-[color:var(--color-line)] p-8 ${
                t.highlight ? "bg-[color:var(--color-ink)] text-white" : "bg-white"
              }`}
            >
              {t.highlight && (
                <span className="absolute top-4 right-4 inline-flex items-center rounded-full bg-[color:var(--color-brand)] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-white">
                  Most popular
                </span>
              )}
              <div className="text-[14px] font-semibold uppercase tracking-[0.08em]">
                {t.name}
              </div>
              <div className="mt-5 flex items-baseline gap-2">
                <span className="text-[40px] font-semibold tracking-[-0.02em]">
                  {t.price}
                </span>
                <span
                  className={`text-[14px] ${
                    t.highlight
                      ? "text-white/70"
                      : "text-[color:var(--color-muted)]"
                  }`}
                >
                  {t.cadence}
                </span>
              </div>
              <p
                className={`mt-3 text-[14px] ${
                  t.highlight
                    ? "text-white/80"
                    : "text-[color:var(--color-muted)]"
                }`}
              >
                {t.tagline}
              </p>

              <ul className="mt-6 space-y-3">
                {t.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-[14px]">
                    <CheckGlyph highlight={t.highlight} />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <a
                href="#"
                className={`mt-8 inline-flex w-full items-center justify-center rounded-lg px-4 py-2.5 text-[14px] font-semibold transition-colors ${
                  t.highlight
                    ? "bg-white text-[color:var(--color-ink)] hover:bg-white/90"
                    : "bg-[color:var(--color-brand)] text-white hover:bg-[color:var(--color-brand-hover)]"
                }`}
              >
                {t.cta}
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CheckGlyph({ highlight }: { highlight: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      className="mt-0.5 flex-none"
      aria-hidden
    >
      <path
        d="M3 8l3.5 3.5L13 4"
        stroke={highlight ? "#fff" : "var(--color-brand)"}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
