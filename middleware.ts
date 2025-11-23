import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;

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

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*"],
  runtime: "nodejs",
};
