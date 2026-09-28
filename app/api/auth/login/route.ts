import { createHash, timingSafeEqual } from "crypto"
import { NextResponse, type NextRequest } from "next/server"
import {
  SESSION_COOKIE,
  SESSION_DURATION_SECONDS,
  createSessionToken,
  sessionCookieOptions,
  type SessionRole,
} from "@/lib/auth"

// Credentials live in .env.local (server only), never in browser code.
const ACCOUNTS: { role: SessionRole; usernameEnv: string; passwordEnv: string }[] = [
  { role: "admin", usernameEnv: "ADMIN_USERNAME", passwordEnv: "ADMIN_PASSWORD" },
]

// Hash both sides so the comparison is constant-time regardless of length.
const safeEqual = (a: string, b: string) =>
  timingSafeEqual(createHash("sha256").update(a).digest(), createHash("sha256").update(b).digest())

// Simple in-memory brute-force protection: 5 failed attempts per IP per
// 10 minutes. Resets when the server restarts, which is fine for this site.
const MAX_FAILURES = 5
const WINDOW_MS = 10 * 60 * 1000
const failures = new Map<string, { count: number; firstAt: number }>()

function clientIp(request: NextRequest) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.ip || "unknown"
}

export async function POST(request: NextRequest) {
  const ip = clientIp(request)
  const entry = failures.get(ip)
  if (entry && Date.now() - entry.firstAt > WINDOW_MS) failures.delete(ip)
  if ((failures.get(ip)?.count ?? 0) >= MAX_FAILURES) {
    return NextResponse.json(
      { error: "Too many failed attempts. Try again in a few minutes." },
      { status: 429 },
    )
  }

  const body = await request.json().catch(() => null)
  const username = typeof body?.username === "string" ? body.username.trim() : ""
  const password = typeof body?.password === "string" ? body.password : ""

  const account = ACCOUNTS.find(({ usernameEnv, passwordEnv }) => {
    const expectedUser = process.env[usernameEnv]
    const expectedPassword = process.env[passwordEnv]
    if (!expectedUser || !expectedPassword) return false
    // Evaluate both so timing doesn't reveal which one was wrong.
    const userOk = safeEqual(username, expectedUser)
    const passwordOk = safeEqual(password, expectedPassword)
    return userOk && passwordOk
  })

  if (!account) {
    const current = failures.get(ip)
    failures.set(ip, { count: (current?.count ?? 0) + 1, firstAt: current?.firstAt ?? Date.now() })
    return NextResponse.json({ error: "Invalid username or password" }, { status: 401 })
  }

  failures.delete(ip)
  const { token, expiresAt } = await createSessionToken(account.role)
  const response = NextResponse.json({ role: account.role, expiresAt })
  response.cookies.set(SESSION_COOKIE, token, sessionCookieOptions(SESSION_DURATION_SECONDS))
  return response
}
