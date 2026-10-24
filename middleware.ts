import { NextResponse, type NextRequest } from "next/server";
import { AUTH_COOKIE, verifyToken } from "@/lib/jwt";

/**
 * Route protection:
 *  - /account/*  → must be logged in
 *  - /admin/*    → must be an ADMIN (except /admin/login)
 * API routes do their own checks (requireUser / requireAdmin) as well.
 */
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const session = await verifyToken(req.cookies.get(AUTH_COOKIE)?.value);

  if (pathname.startsWith("/admin")) {
    if (pathname === "/admin/login") {
      if (session?.role === "ADMIN") return NextResponse.redirect(new URL("/admin", req.url));
      return NextResponse.next();
    }
    if (!session || session.role !== "ADMIN") {
      const url = new URL("/admin/login", req.url);
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
  }

  if (pathname.startsWith("/account") && !session) {
    const url = new URL("/login", req.url);
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/account/:path*"],
};
