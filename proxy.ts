import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected =
    pathname.startsWith("/dashboard") &&
    !pathname.startsWith("/dashboard/login");
  const isStaffApi =
    pathname.startsWith("/api/staff") &&
    !pathname.startsWith("/api/staff/public");

  if (!isProtected && !isStaffApi) {
    return NextResponse.next();
  }

  const sessionCookie = getSessionCookie(request);

  if (!sessionCookie) {
    if (isStaffApi) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/dashboard/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/api/staff/:path*"],
};
