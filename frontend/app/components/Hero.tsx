export default function Hero() {
  return (
    <section
      id="hero-cta"
      className="border-b border-[color:var(--color-line)]"
    >
      <div className="max-w-[1280px] mx-auto px-6 md:px-10 pt-20 pb-24 md:pt-28 md:pb-32 grid md:grid-cols-12 gap-10 md:gap-8 items-center">
        <div className="md:col-span-7">
          <div className="inline-flex items-center gap-2 rounded-full bg-[color:var(--color-brand-subtle)] px-3 py-1.5 mb-8">
            <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--color-brand)]" />
            <span className="text-[13px] font-semibold text-[color:var(--color-brand)]">
              New
            </span>
            <span className="text-[13px] text-[color:var(--color-muted)]">
              Ombudsman appeal generator is live
            </span>
            <span className="text-[color:var(--color-brand)]">→</span>
          </div>

          <h1 className="text-[44px] md:text-[64px] lg:text-[72px] font-semibold leading-[1.02] tracking-[-0.03em] text-[color:var(--color-ink)]">
            Know your claim&apos;s fate{" "}
            <span className="text-[color:var(--color-brand)]">before</span> you
            file it.
          </h1>

          <p className="mt-6 max-w-[560px] text-[17px] leading-[1.6] text-[color:var(--color-muted)]">
            ClaimShield is an AI-powered pre-claim audit for Indian health
            insurance. Upload your policy and hospital documents — we predict
            rejection probability, explain the reasons, and hand you a fix-it
            checklist.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <a
              href="#"
              className="inline-flex items-center justify-center rounded-lg bg-[color:var(--color-brand)] px-6 py-3 text-[15px] font-semibold text-white transition-colors hover:bg-[color:var(--color-brand-hover)]"
            >
              Audit my claim — ₹499
            </a>
            <a
              href="#how"
              className="inline-flex items-center gap-2 text-[15px] font-semibold text-[color:var(--color-ink)] hover:text-[color:var(--color-brand)] transition-colors"
            >
              See how it works
              <span aria-hidden>→</span>
            </a>
          </div>

          <div className="mt-10 flex items-center gap-6 text-[13px] text-[color:var(--color-muted)]">
            <span className="flex items-center gap-2">
              <Check /> DPDP compliant
            </span>
            <span className="flex items-center gap-2">
              <Check /> No data sold to insurers
            </span>
            <span className="flex items-center gap-2">
              <Check /> Built on IRDAI regulations
            </span>
          </div>
        </div>

        <div className="md:col-span-5">
          <ScoreCard />
        </div>
      </div>
    </section>
  );
}

function Check() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
      <path
        d="M2 7l3.5 3.5L12 3"
        stroke="var(--color-success)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ScoreCard() {
  return (
    <div className="relative border border-[color:var(--color-line)] bg-white">
      <div className="flex items-center justify-between border-b border-[color:var(--color-line)] px-5 py-3">
        <div className="flex items-center gap-2 text-[13px] font-semibold text-[color:var(--color-ink)]">
          <span className="h-2 w-2 rounded-full bg-[color:var(--color-success)]" />
          Live claim audit
        </div>
        <span className="text-[12px] text-[color:var(--color-muted)]">
          star_health_family_floater.pdf
        </span>
      </div>

      <div className="px-6 py-6">
        <div className="text-[13px] font-semibold uppercase tracking-[0.08em] text-[color:var(--color-muted)]">
          Approval probability
        </div>

        <div className="mt-3 flex items-end gap-3">
          <div className="text-[56px] leading-none font-semibold tracking-[-0.02em] text-[color:var(--color-ink)]">
            62
          </div>
          <div className="pb-2 text-[20px] font-semibold text-[color:var(--color-ink)]">
            %
          </div>
          <span className="ml-auto inline-flex items-center rounded-full bg-[#FEF3C7] px-2.5 py-1 text-[12px] font-semibold text-[#92400E]">
            Medium risk
          </span>
        </div>

        <div className="mt-3 h-1.5 w-full rounded-full bg-[color:var(--color-surface-alt)] overflow-hidden">
          <div
            className="h-full rounded-full bg-[color:var(--color-brand)]"
            style={{ width: "62%" }}
          />
        </div>

        <ul className="mt-6 space-y-3">
          <Row
            tone="danger"
            title="Room rent exceeds limit"
            meta="₹8,000 proportionate deduction expected"
          />
          <Row
            tone="warn"
            title="Pre-authorization not yet obtained"
            meta="Submit within 24 hours of admission"
          />
          <Row
            tone="ok"
            title="Within sum insured"
            meta="₹1.8L billed vs ₹10L available"
          />
        </ul>

        <a
          href="#"
          className="mt-6 inline-flex items-center justify-center w-full rounded-lg bg-[color:var(--color-ink)] px-4 py-2.5 text-[14px] font-semibold text-white hover:bg-[color:var(--color-ink-soft)] transition-colors"
        >
          Show 4 fixes to raise score →
        </a>
      </div>
    </div>
  );
}

function Row({
  tone,
  title,
  meta,
}: {
  tone: "ok" | "warn" | "danger";
  title: string;
  meta: string;
}) {
  const map = {
    ok: { bg: "#DCFCE7", fg: "#15803D", glyph: "✓" },
    warn: { bg: "#FEF3C7", fg: "#B45309", glyph: "!" },
    danger: { bg: "#FEE2E2", fg: "#B91C1C", glyph: "✕" },
  }[tone];

  return (
    <li className="flex items-start gap-3">
      <span
        className="mt-0.5 inline-flex h-5 w-5 flex-none items-center justify-center rounded-full text-[11px] font-bold"
        style={{ background: map.bg, color: map.fg }}
      >
        {map.glyph}
      </span>
      <div>
        <div className="text-[14px] font-semibold text-[color:var(--color-ink)]">
          {title}
        </div>
        <div className="text-[13px] text-[color:var(--color-muted)]">
          {meta}
        </div>
      </div>
    </li>
  );
}
