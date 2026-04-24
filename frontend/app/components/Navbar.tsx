"use client";

import { useState } from "react";

const navLinks = [
  { label: "How it works", href: "#how" },
  { label: "Features", href: "#features" },
  { label: "Insurers", href: "#insurers" },
  { label: "Pricing", href: "#pricing" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-[color:var(--color-line)]">
      <nav className="max-w-[1280px] mx-auto flex items-center justify-between px-6 md:px-10 h-16">
        <a href="#" className="flex items-center gap-2 text-[color:var(--color-ink)]">
          <ShieldMark />
          <span className="text-[17px] font-semibold tracking-tight">
            Claim<span className="text-[color:var(--color-brand)]">Shield</span>
          </span>
        </a>

        <ul className="hidden md:flex items-center gap-8">
          {navLinks.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                className="text-[14px] font-medium text-[color:var(--color-ink)] hover:text-[color:var(--color-brand)] transition-colors"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="hidden md:flex items-center gap-3">
          <a
            href="#"
            className="text-[14px] font-medium text-[color:var(--color-ink)] hover:text-[color:var(--color-brand)] transition-colors"
          >
            Sign in
          </a>
          <a
            href="#hero-cta"
            className="inline-flex items-center rounded-lg bg-[color:var(--color-brand)] px-4 py-2 text-[14px] font-semibold text-white transition-colors hover:bg-[color:var(--color-brand-hover)]"
          >
            Audit my claim
          </a>
        </div>

        <button
          aria-label="Toggle menu"
          onClick={() => setOpen((v) => !v)}
          className="md:hidden flex flex-col gap-1.5 p-2"
        >
          <span className="block h-0.5 w-6 bg-[color:var(--color-ink)]" />
          <span className="block h-0.5 w-6 bg-[color:var(--color-ink)]" />
          <span className="block h-0.5 w-6 bg-[color:var(--color-ink)]" />
        </button>
      </nav>

      {open && (
        <div className="md:hidden border-t border-[color:var(--color-line)] bg-white">
          <ul className="px-6 py-4 flex flex-col gap-3">
            {navLinks.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="block py-2 text-[15px] font-medium text-[color:var(--color-ink)]"
                >
                  {l.label}
                </a>
              </li>
            ))}
            <li>
              <a
                href="#hero-cta"
                onClick={() => setOpen(false)}
                className="mt-2 inline-flex w-full justify-center items-center rounded-lg bg-[color:var(--color-brand)] px-4 py-2.5 text-[14px] font-semibold text-white"
              >
                Audit my claim
              </a>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}

function ShieldMark() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 2L4 5v6c0 5 3.5 9.5 8 11 4.5-1.5 8-6 8-11V5l-8-3z"
        fill="var(--color-brand)"
      />
      <path
        d="M9 12l2 2 4-4"
        stroke="#fff"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
