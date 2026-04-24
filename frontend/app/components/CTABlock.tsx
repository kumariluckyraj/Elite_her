export default function CTABlock() {
  return (
    <section className="border-b border-[color:var(--color-line)] bg-[color:var(--color-brand)]">
      <div className="max-w-[1280px] mx-auto px-6 md:px-10 py-24 md:py-28 text-center">
        <h2 className="text-[36px] md:text-[52px] font-semibold leading-[1.1] tracking-[-0.02em] text-white max-w-[780px] mx-auto">
          Your next claim shouldn&apos;t be a coin toss.
        </h2>
        <p className="mt-5 text-[17px] leading-[1.6] text-white/85 max-w-[560px] mx-auto">
          Upload your policy. We&apos;ll tell you exactly where it leaves you
          exposed — and what to do about it before the hospital gate closes.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
          <a
            href="#"
            className="inline-flex items-center justify-center rounded-lg bg-white px-6 py-3 text-[15px] font-semibold text-[color:var(--color-brand)] transition-transform hover:-translate-y-0.5"
          >
            Audit my claim — ₹499
          </a>
          <a
            href="#"
            className="inline-flex items-center justify-center rounded-lg border border-white/40 px-6 py-3 text-[15px] font-semibold text-white hover:bg-white/10 transition-colors"
          >
            Talk to hospitals team
          </a>
        </div>
      </div>
    </section>
  );
}
