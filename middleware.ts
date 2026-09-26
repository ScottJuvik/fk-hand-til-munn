import { NextResponse, type NextRequest } from "next/server"
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth"

// Server-side access control. Every /admin page and every API route except
// the public ones below needs a valid, unexpired admin session cookie.
// (All other API routes write to the database, including the GET seed
// routes, so none of them may be called anonymously.)
const PUBLIC_API = [
  { path: "/api/auth/login", method: "POST" },
  { path: "/api/auth/logout", method: "POST" },
  { path: "/api/auth/session", method: "GET" },
  { path: "/api/booking", method: "POST" },
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (PUBLIC_API.some((route) => route.path === pathname && route.method === request.method)) {
    return NextResponse.next()
  }

  const cookie = request.cookies.get(SESSION_COOKIE)?.value
  const session = await verifySessionToken(cookie)
  if (session?.role === "admin") {
    return NextResponse.next()
  }

  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Not authorized. Please log in again." }, { status: 401 })
  }

  // Admin page: send to login, and come back here afterwards.
  const loginUrl = new URL("/login", request.url)
  loginUrl.searchParams.set("next", pathname + request.nextUrl.search)
  if (cookie) loginUrl.searchParams.set("expired", "1")
  const response = NextResponse.redirect(loginUrl)
  // Drop an expired/invalid cookie so it isn't sent on every request.
  if (cookie) response.cookies.delete(SESSION_COOKIE)
  return response
}

export const config = {
  matcher: ["/admin/:path*", "/api/:path*"],
}
