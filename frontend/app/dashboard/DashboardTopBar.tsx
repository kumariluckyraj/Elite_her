"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Crumb = { label: string; href?: string };

const PRIMARY: Record<string, string> = {
  policies: "Policies",
  cases: "Cases",
  reports: "Reports",
  compare: "Compare",
};

function buildCrumbs(pathname: string): Crumb[] {
  const segments = pathname.split("/").filter(Boolean);
  if (segments[0] !== "dashboard") return [];
  const rest = segments.slice(1);
  if (rest.length === 0) return [{ label: "Dashboard" }];

  const crumbs: Crumb[] = [];
  const top = rest[0];
  const topLabel = PRIMARY[top] ?? capitalize(top);
  const topHref = `/dashboard/${top}`;

  if (rest.length === 1) {
    crumbs.push({ label: topLabel });
    return crumbs;
  }

  crumbs.push({ label: topLabel, href: topHref });

  if (rest.length === 2) {
    crumbs.push({ label: shortId(rest[1]) });
  } else {
    crumbs.push({
      label: shortId(rest[1]),
      href: `/dashboard/${top}/${rest[1]}`,
    });
    crumbs.push({ label: capitalize(rest.slice(2).join(" / ")) });
  }
  return crumbs;
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function shortId(id: string): string {
  if (/^[a-f0-9]{20,}$/i.test(id)) {
    return `Detail · ${id.slice(-6)}`;
  }
  return id;
}

export default function DashboardTopBar() {
  const pathname = usePathname();
  const crumbs = buildCrumbs(pathname);

  return (
    <header className="hidden md:flex items-center justify-between gap-4 h-14 shrink-0 px-6 md:px-10 bg-white/80 backdrop-blur-md border-b border-line">
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 min-w-0">
        <Link
          href="/dashboard/policies"
          className="text-[12px] font-bold uppercase tracking-[0.1em] text-muted hover:text-brand transition-colors"
        >
          Workspace
        </Link>
        {crumbs.map((c, i) => (
          <span key={i} className="flex items-center gap-1.5 min-w-0">
            <Chevron />
            {c.href ? (
              <Link
                href={c.href}
                className="text-[13px] font-medium text-muted hover:text-ink transition-colors truncate max-w-[200px]"
              >
                {c.label}
              </Link>
            ) : (
              <span className="text-[13px] font-semibold text-ink truncate max-w-[260px]">
                {c.label}
              </span>
            )}
          </span>
        ))}
      </nav>

      <div className="flex items-center gap-2 shrink-0">
        <SearchHint />
        <a
          href="https://irdai.gov.in"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 h-9 rounded-lg text-[13px] font-medium text-muted hover:text-ink hover:bg-surface transition-colors"
        >
          <BookIcon />
          IRDAI
        </a>
        <a
          href="https://github.com"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Help"
          className="inline-flex items-center justify-center w-9 h-9 rounded-lg text-muted hover:text-ink hover:bg-surface transition-colors"
        >
          <HelpIcon />
        </a>
      </div>
    </header>
  );
}

function Chevron() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      className="text-line shrink-0"
      aria-hidden
    >
      <path
        d="M9 6l6 6-6 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SearchHint() {
  return (
    <button
      type="button"
      className="hidden lg:inline-flex items-center gap-2 h-9 px-3 rounded-lg border border-line bg-white text-muted hover:text-ink hover:border-brand-subtle transition-colors text-[13px]"
      aria-label="Search (coming soon)"
      disabled
    >
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <circle cx="11" cy="11" r="7" />
        <path d="M21 21l-4.35-4.35" strokeLinecap="round" />
      </svg>
      <span>Search</span>
      <span className="ml-2 inline-flex items-center gap-0.5 px-1.5 h-5 rounded text-[10px] font-bold bg-surface-alt text-muted border border-line">
        <kbd className="font-sans">⌘</kbd>
        <kbd className="font-sans">K</kbd>
      </span>
    </button>
  );
}

function BookIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 19.5A2.5 2.5 0 016.5 17H20V2H6.5A2.5 2.5 0 004 4.5v15z" />
      <path d="M4 19.5A2.5 2.5 0 016.5 22H20" />
    </svg>
  );
}

function HelpIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}
