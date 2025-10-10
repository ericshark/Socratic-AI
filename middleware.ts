import { NextResponse } from "next/server";
import { auth } from "@/server/auth";

export default auth((req) => {
  const isAuthRoute = req.nextUrl.pathname.startsWith("/auth");
  const isApiRoute = req.nextUrl.pathname.startsWith("/api");

  if (!req.auth && !isAuthRoute) {
    if (req.nextUrl.pathname.startsWith("/app")) {
      const signInUrl = new URL("/auth/sign-in", req.nextUrl.origin);
      signInUrl.searchParams.set("callbackUrl", req.nextUrl.toString());
      return NextResponse.redirect(signInUrl);
    }

    if (isApiRoute) {
      return new NextResponse(
        JSON.stringify({ error: "Unauthorized" }),
        {
          status: 401,
          headers: {
            "content-type": "application/json",
          },
        },
      );
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/app/:path*",
    "/api/decisions/:path*",
    "/api/packs/:path*",
    "/api/forecasts/:path*",
    "/api/rounds/:path*",
    "/api/reviews/:path*",
    "/api/me",
  ],
};
