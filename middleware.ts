import NextAuth from "next-auth";
import authConfig from "@/auth.config";
const { auth } = NextAuth(authConfig);
import {
  DEFAULT_LOGIN_REDIRECT,
  authRoutes,
  apiAuthPrefix,
  isPublicRoute,
} from "@/routes";
import { NextResponse } from "next/server";

// @ts-expect-error @ts-ignore
export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const pathname = nextUrl.pathname;

  if (pathname.startsWith(apiAuthPrefix)) {
    return null;
  }

  if (pathname.startsWith("/api/upload")) {
    return null;
  }

  if (pathname.startsWith("/api/deleteImage")) {
    return null;
  }

  if (pathname.startsWith("/api/media")) {
    return null;
  }

  if (isPublicRoute(pathname)) {
    return null;
  }

  if (authRoutes.includes(pathname)) {
    if (isLoggedIn) {
      return Response.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl));
    }
    return null;
  }

  if (!isLoggedIn) {
    const loginUrl = new URL("/auth/login", nextUrl);
    const callback = `${pathname}${nextUrl.search}`;
    if (callback && callback !== "/") {
      loginUrl.searchParams.set("callbackUrl", callback);
    }
    return NextResponse.redirect(loginUrl);
  }

  return null;
});

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|fonts|sw.js|manifest.json|uploads/).*)",
  ],
};
