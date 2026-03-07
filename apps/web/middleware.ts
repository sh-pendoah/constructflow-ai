import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ✅ Azure Static Web Apps health check — MUST be bypassed
  if (pathname === "/.swa/health") {
    return NextResponse.next();
  }

  const authToken = request.cookies.get("auth_token")?.value;

  // ✅ Root path - allow access without redirect
  if (pathname === "/") {
    return NextResponse.next();
  }

  // ✅ Public routes (no auth required)
  const publicRoutes = ["/auth", "/auth/signup", "/auth/verify", "/onboarding", "/login", "/register"];
  const isPublicRoute = publicRoutes.some((route) =>
    pathname.startsWith(route),
  );

  // ✅ Auth-only routes (redirect to dashboard if already logged in).
  // Exact match on "/auth" to avoid blocking "/auth/verify" which is a
  // public callback URL that must never redirect to dashboard.
  const authOnlyRoutes = ["/auth", "/auth/signup", "/login", "/register"];
  const isAuthOnlyRoute = authOnlyRoutes.some((route) =>
    pathname === route || (route !== "/auth" && pathname.startsWith(route)),
  );

  // ✅ User is authenticated
  if (authToken) {
    if (isAuthOnlyRoute) {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // ❌ User is NOT authenticated
  if (isPublicRoute) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.pathname = "/login";
  return NextResponse.redirect(url);
}

// ✅ Middleware route matcher
export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|\\.swa/health|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
