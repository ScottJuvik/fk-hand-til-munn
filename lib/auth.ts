import { SignJWT, jwtVerify } from "jose"

// Session handling shared by middleware, API routes and the root layout.
// Uses only `jose` + Web Crypto so it also runs in the Edge middleware.
//
// A session is a signed JWT in an httpOnly cookie. It expires a fixed
// 30 minutes after login (no sliding renewal), so nobody stays logged in
// forever.

export type SessionRole = "admin" | "user"

export interface Session {
  role: SessionRole
  /** Expiry as a Unix timestamp in milliseconds. */
  expiresAt: number
}

export const SESSION_COOKIE = "htm_session"
export const SESSION_DURATION_SECONDS = 30 * 60

function getSecret() {
  const secret = process.env.AUTH_SECRET
  if (!secret || secret.length < 32) {
    throw new Error("AUTH_SECRET must be set to at least 32 characters")
  }
  return new TextEncoder().encode(secret)
}

export async function createSessionToken(role: SessionRole) {
  const token = await new SignJWT({ role })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION_SECONDS}s`)
    .sign(getSecret())
  return { token, expiresAt: Date.now() + SESSION_DURATION_SECONDS * 1000 }
}

/** Returns the session for a cookie value, or null if missing, forged or expired. */
export async function verifySessionToken(token: string | undefined): Promise<Session | null> {
  if (!token) return null
  try {
    const { payload } = await jwtVerify(token, getSecret(), { algorithms: ["HS256"] })
    if ((payload.role !== "admin" && payload.role !== "user") || typeof payload.exp !== "number") {
      return null
    }
    return { role: payload.role, expiresAt: payload.exp * 1000 }
  } catch {
    return null
  }
}

export function sessionCookieOptions(maxAgeSeconds: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: maxAgeSeconds,
  }
}
