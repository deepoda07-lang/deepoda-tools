import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const LOCALES = ["en", "tr", "es"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip if already has a valid locale prefix
  const firstSegment = pathname.split("/")[1];
  if (LOCALES.includes(firstSegment)) return NextResponse.next();

  // Skip internal Next.js routes
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".") // static files
  ) {
    return NextResponse.next();
  }

  // Redirect bare paths to /en/ prefix
  const url = request.nextUrl.clone();
  url.pathname = `/en${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url, 301);
}

export const config = {
  matcher: ["/((?!_next|api|icon\\.png|robots\\.txt|sitemap\\.xml|favicon\\.ico).*)"],
};
