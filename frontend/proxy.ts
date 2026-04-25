import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE, verifySession } from "./lib/auth";

const PROTECTED_PAGE_PREFIXES = ["/dashboard"];
const PROTECTED_API_PREFIXES = ["/api/policies", "/api/cases"];
const AUTH_PAGES = ["/login", "/signup"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const session = token ? await verifySession(token) : null;

  const isProtectedPage = PROTECTED_PAGE_PREFIXES.some((p) =>
    pathname.startsWith(p),
  );
  const isProtectedApi = PROTECTED_API_PREFIXES.some((p) =>
    pathname.startsWith(p),
  );
  const isAuthPage = AUTH_PAGES.includes(pathname);

  if ((isProtectedPage || isProtectedApi) && !session) {
    if (isProtectedApi) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 },
      );
    }
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (isAuthPage && session) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard/policies";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/api/policies/:path*",
    "/api/cases/:path*",
    "/login",
    "/signup",
  ],
};
