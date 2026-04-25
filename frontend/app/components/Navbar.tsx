"use client";

import { useState } from "react";
import Link from "next/link";

const navLinks = [
  { label: "How it works", href: "#how" },
  { label: "Features", href: "#features" },
  { label: "Insurers", href: "#insurers" },
  { label: "Pricing", href: "#pricing" },
];

export default function Navbar({ userEmail }: { userEmail?: string }) {

  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-[color:var(--color-line)]">
      <nav className="max-w-[1280px] mx-auto flex items-center justify-between px-6 md:px-10 h-16">
        <Link
          href="/"
          className="flex items-center gap-2.5 group"
          aria-label="Indira home"
        >
          <IndiraMark />
          <Wordmark />
        </Link>

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

        <div className="hidden md:flex items-center gap-6">
          {userEmail ? (
            <Link
              href="/dashboard"
              className="flex items-center gap-2 text-[14px] font-medium hover:text-[color:var(--color-brand)] transition-colors"
            >
              <span className="w-8 h-8 rounded-full bg-[color:var(--color-brand-subtle)] text-[color:var(--color-brand)] flex items-center justify-center text-[13px] font-semibold">
                {userEmail[0]?.toUpperCase()}
              </span>
              <span className="truncate max-w-[160px] text-[color:var(--color-ink)]">
                {userEmail}
              </span>
            </Link>
          ) : (
            <Link
              href="/login"
              className="text-[14px] font-medium text-[color:var(--color-ink)] hover:text-[color:var(--color-brand)] transition-colors"
            >
              Sign in
            </Link>
          )}
          <Link
            href="/signup"
            className="inline-flex items-center rounded-lg bg-[color:var(--color-brand)] px-4 py-2 text-[14px] font-semibold text-white transition-colors hover:bg-[color:var(--color-brand-hover)]"
          >
            Audit my claim
          </Link>
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
            {userEmail ? (
              <li className="py-2 border-b border-[color:var(--color-line)] mb-2">
                <Link
                  href="/dashboard"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3"
                >
                  <span className="w-8 h-8 rounded-full bg-[color:var(--color-brand-subtle)] text-[color:var(--color-brand)] flex items-center justify-center text-[13px] font-semibold">
                    {userEmail[0]?.toUpperCase()}
                  </span>
                  <span className="text-[15px] font-medium text-[color:var(--color-ink)] truncate">
                    {userEmail}
                  </span>
                </Link>
              </li>
            ) : (
              <li>
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="block py-2 text-[15px] font-medium text-[color:var(--color-ink)]"
                >
                  Sign in
                </Link>
              </li>
            )}
            <li>
              <Link
                href="/signup"
                onClick={() => setOpen(false)}
                className="mt-2 inline-flex w-full justify-center items-center rounded-lg bg-[color:var(--color-brand)] px-4 py-2.5 text-[14px] font-semibold text-white"
              >
                Audit my claim
              </Link>
            </li>

          </ul>
        </div>
      )}
    </header>
  );
}

function IndiraMark() {
  return (
    <span
      className="inline-flex items-center justify-center w-8 h-8 rounded-[10px] text-white shadow-sm"
      style={{
        background:
          "linear-gradient(135deg, var(--color-brand) 0%, #1B52D9 100%)",
      }}
      aria-hidden
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path
          d="M5 3h6M5 13h6M8 3v10"
          stroke="#fff"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        <circle cx="8" cy="8" r="1.4" fill="#fff" />
      </svg>
    </span>
  );
}

function Wordmark() {
  return (
    <span className="inline-flex items-baseline gap-1 group-hover:opacity-90 transition-opacity">
      <span
        className="text-[20px] font-bold tracking-[-0.035em] leading-none bg-clip-text text-transparent"
        style={{
          backgroundImage:
            "linear-gradient(125deg, #1A1A1A 0%, #1A1A1A 55%, #2C68FF 100%)",
        }}
      >
        ind<span className="italic">i</span>ra
      </span>
      <span
        aria-hidden
        className="w-1 h-1 rounded-full bg-[color:var(--color-brand)] mb-0.5"
      />
    </span>
  );
}
