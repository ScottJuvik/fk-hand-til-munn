import "server-only"
import { createClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"
import type { Database } from "@/types/supabase"
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth"

// Database access is server-only. "server-only" makes the build fail if this
// file is ever imported from a client component, so the service key, the
// queries and the raw responses never reach the browser. Client code gets
// data through the server actions in /actions or the /api routes instead.

export const createServerSupabaseClient = () => {
  const supabaseUrl = process.env.SUPABASE_URL as string
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string
  return createClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false },
  })
}

/**
 * Server actions are public POST endpoints, so the middleware can't guard
 * them. Call this at the top of every admin-only action.
 */
export async function requireAdmin() {
  const session = await verifySessionToken(cookies().get(SESSION_COOKIE)?.value)
  if (session?.role !== "admin") {
    throw new Error("Not authorized")
  }
}

/** Logs the real database error on the server and returns a generic one for the client. */
export function publicError(context: string, error: unknown): string | null {
  if (!error) return null
  console.error(`${context}:`, error)
  return `${context} failed`
}
