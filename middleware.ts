import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

// Allowed origins for CSRF protection
const ALLOWED_ORIGINS = [
  'https://pixelift.pl',
  'https://www.pixelift.pl',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
];

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const response = NextResponse.next();

  // CSRF protection for API routes (POST, PUT, PATCH, DELETE)
  if (pathname.startsWith("/api/") && ["POST", "PUT", "PATCH", "DELETE"].includes(req.method)) {
    const origin = req.headers.get("origin");
    const referer = req.headers.get("referer");

    // Skip CSRF check for internal NextAuth routes
    if (!pathname.startsWith("/api/auth/")) {
      const isAllowedOrigin = origin
        ? ALLOWED_ORIGINS.some(allowed => origin.startsWith(allowed))
        : referer
          ? ALLOWED_ORIGINS.some(allowed => referer.startsWith(allowed))
          : true; // Allow requests without origin (same-origin, non-browser)

      if (!isAllowedOrigin) {
        return NextResponse.json(
          { error: "CSRF validation failed" },
          { status: 403 }
        );
      }
    }
  }

  // Protect admin routes
  if (pathname.startsWith("/admin")) {
    // Check if user is authenticated
    if (!req.auth?.user) {
      // Not logged in - redirect to signin
      const signInUrl = new URL("/auth/signin", req.url);
      signInUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(signInUrl);
    }

    // Check if user is admin (from JWT token)
    const isAdmin = req.auth?.user?.isAdmin === true;

    if (!isAdmin) {
      // Logged in but not admin - redirect to home
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  return response;
});

export const config = {
  matcher: ["/admin/:path*", "/api/:path*"],
  runtime: "nodejs",
};
