"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

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

function PoliciesIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
      <polyline points="14 2 14 8 20 8"></polyline>
      <line x1="16" y1="13" x2="8" y2="13"></line>
      <line x1="16" y1="17" x2="8" y2="17"></line>
      <polyline points="10 9 9 9 8 9"></polyline>
    </svg>
  );
}

function CasesIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
      <line x1="16" y1="2" x2="16" y2="6"></line>
      <line x1="8" y1="2" x2="8" y2="6"></line>
      <line x1="3" y1="10" x2="21" y2="10"></line>
      <rect x="8" y="14" width="8" height="4" rx="1"></rect>
    </svg>
  );
}

function LogOutIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
      <polyline points="16 17 21 12 16 7"></polyline>
      <line x1="21" y1="12" x2="9" y2="12"></line>
    </svg>
  );
}

const tabs = [
  { href: "/dashboard/policies", label: "Policies", icon: PoliciesIcon },
  { href: "/dashboard/cases", label: "Cases", icon: CasesIcon },
];

export default function DashboardNav({ email }: { email: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <>
      {/* Mobile Top Header */}
      <div className="md:hidden flex items-center justify-between bg-white border-b border-[color:var(--color-line)] px-6 h-16 shrink-0">
        <Link href="/dashboard/policies" className="flex items-center gap-2 text-[color:var(--color-ink)]">
          <ShieldMark />
          <span className="text-[17px] font-semibold tracking-tight">
            Claim<span className="text-[color:var(--color-brand)]">Shield</span>
          </span>
        </Link>
        <button onClick={() => setMenuOpen((v) => !v)} className="p-2 flex flex-col gap-1.5">
          <span className="block h-0.5 w-6 bg-[color:var(--color-ink)]" />
          <span className="block h-0.5 w-6 bg-[color:var(--color-ink)]" />
          <span className="block h-0.5 w-6 bg-[color:var(--color-ink)]" />
        </button>
      </div>

      {/* Sidebar Desktop & Mobile Menu */}
      <aside className={`
        ${menuOpen ? "block" : "hidden"} 
        md:flex flex-col w-full md:w-64 bg-white border-r border-[color:var(--color-line)] md:h-screen shrink-0 z-40
      `}>
        <div className="hidden md:flex p-6 h-16 shrink-0 border-b border-[color:var(--color-line)]">
          <Link href="/dashboard/policies" className="flex items-center gap-2 text-[color:var(--color-ink)]">
            <ShieldMark />
            <span className="text-[17px] font-semibold tracking-tight">
              Claim<span className="text-[color:var(--color-brand)]">Shield</span>
            </span>
          </Link>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {tabs.map((t) => {
            const active = pathname.startsWith(t.href);
            const Icon = t.icon;
            return (
              <Link
                key={t.href}
                href={t.href}
                onClick={() => setMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-[15px] font-medium transition-all duration-200 ${
                  active
                    ? "bg-[color:var(--color-brand-subtle)] text-[color:var(--color-brand)] shadow-sm"
                    : "text-[color:var(--color-muted)] hover:bg-[color:var(--color-surface)] hover:text-[color:var(--color-ink)]"
                }`}
              >
                <Icon className={`w-[18px] h-[18px] ${active ? "text-[color:var(--color-brand)]" : "text-[color:var(--color-muted)]"}`} />
                {t.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-[color:var(--color-line)] shrink-0">
          <div className="flex items-center gap-3 px-2 py-3 mb-2">
            <span className="w-8 h-8 shrink-0 rounded-full bg-[color:var(--color-brand-subtle)] text-[color:var(--color-brand)] flex items-center justify-center text-[13px] font-semibold shadow-sm">
              {email[0]?.toUpperCase()}
            </span>
            <span className="truncate text-[14px] font-medium text-[color:var(--color-ink)]">
              {email}
            </span>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-[14px] font-medium text-red-600 hover:bg-red-50 rounded-xl transition-colors"
          >
            <LogOutIcon className="w-[18px] h-[18px]" />
            Sign out
          </button>
        </div>
      </aside>
    </>
  );
}
