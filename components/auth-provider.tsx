"use client"

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import type { Session, SessionRole } from "@/lib/auth"

type UserRole = SessionRole | null

interface AuthContextType {
  userRole: UserRole
  /** When the current session ends (ms since epoch), or null if logged out. */
  expiresAt: number | null
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string; role?: UserRole }>
  logout: () => Promise<void>
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// The session itself is an httpOnly cookie checked by middleware.ts; this
// provider only mirrors it for the UI. `initialSession` comes from the root
// layout (read server-side), so the role is correct on the very first render.
export function AuthProvider({ children, initialSession }: { children: ReactNode; initialSession: Session | null }) {
  const router = useRouter()
  const [userRole, setUserRole] = useState<UserRole>(initialSession?.role ?? null)
  const [expiresAt, setExpiresAt] = useState<number | null>(initialSession?.expiresAt ?? null)

  const clearSession = useCallback(() => {
    setUserRole(null)
    setExpiresAt(null)
  }, [])

  // Log out automatically the moment the session expires.
  useEffect(() => {
    if (!expiresAt) return
    const timeout = setTimeout(async () => {
      await fetch("/api/auth/logout", { method: "POST" }).catch(() => {})
      clearSession()
      if (window.location.pathname.startsWith("/admin")) {
        router.push(`/login?expired=1&next=${encodeURIComponent(window.location.pathname)}`)
      }
    }, Math.max(0, expiresAt - Date.now()))
    return () => clearTimeout(timeout)
  }, [expiresAt, clearSession, router])

  // Timers pause while a laptop sleeps, so re-check when the tab comes back.
  useEffect(() => {
    const recheck = async () => {
      if (document.visibilityState !== "visible") return
      try {
        const session: Session | { role: null; expiresAt: null } = await fetch("/api/auth/session").then((r) => r.json())
        setUserRole(session.role)
        setExpiresAt(session.expiresAt)
      } catch {
        // Offline: keep the current state; the expiry timer still applies.
      }
    }
    document.addEventListener("visibilitychange", recheck)
    return () => document.removeEventListener("visibilitychange", recheck)
  }, [])

  const login = async (username: string, password: string) => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      })
      const result = await response.json().catch(() => ({}))
      if (!response.ok) {
        return { success: false, error: result.error || "Invalid username or password" }
      }
      setUserRole(result.role)
      setExpiresAt(result.expiresAt)
      router.refresh()
      return { success: true, role: result.role as UserRole }
    } catch (error) {
      console.error("Login error:", error)
      return { success: false, error: "An error occurred during login" }
    }
  }

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
    } catch (error) {
      console.error("Logout error:", error)
    }
    clearSession()
    router.push("/login")
    router.refresh()
  }

  return (
    <AuthContext.Provider value={{ userRole, expiresAt, login, logout, isLoading: false }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
