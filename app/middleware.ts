import { auth } from "@/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Routes that require authentication
const protectedPaths = ["/dashboard", "/settings", "/documents", "/2fa/setup", "/applications", "/admin"];

// Routes only for guests (redirect to dashboard if logged in)
const guestPaths = ["/login", "/register"];

export default auth((req) => {
  const { nextUrl, auth: session } = req as NextRequest & {
    auth: { user?: { twoFactorEnabled?: boolean; twoFactorVerified?: boolean; accountStatus?: string } } | null;
  };
  const pathname = nextUrl.pathname;

  const isProtected = protectedPaths.some((p) => pathname.startsWith(p));
  const isGuest = guestPaths.some((p) => pathname.startsWith(p));
  const isLoggedIn = !!session?.user;

  // Not logged in → redirect to login
  if (isProtected && !isLoggedIn) {
    const url = new URL("/login", nextUrl.origin);
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  // Logged in but 2FA not verified → force 2FA step
  if (
    isLoggedIn &&
    isProtected &&
    session?.user?.twoFactorEnabled &&
    !session?.user?.twoFactorVerified &&
    !pathname.startsWith("/2fa")
  ) {
    return NextResponse.redirect(new URL("/2fa/verify", nextUrl.origin));
  }

  // Logged in but account suspended
  if (isLoggedIn && isProtected && session?.user?.accountStatus === "SUSPENDED") {
    return NextResponse.redirect(new URL("/suspended", nextUrl.origin));
  }

  // Already logged in → redirect away from guest pages
  if (isGuest && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", nextUrl.origin));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!api/auth|api/stripe/webhook|_next/static|_next/image|favicon.ico).*)",
  ],
};
