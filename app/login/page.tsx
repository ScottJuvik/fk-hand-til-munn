"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Lock, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useAuth } from "@/components/auth-provider"
import { LoginParticles } from "@/components/login-particles"

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [notice, setNotice] = useState("")

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("expired")) {
      setNotice("Your session expired after 30 minutes. Please log in again.")
    }
  }, [])

  // Only follow same-site paths, never absolute URLs (open-redirect safety).
  const getNextPath = () => {
    const next = new URLSearchParams(window.location.search).get("next")
    if (next && next.startsWith("/") && !next.startsWith("//")) return next
    return "/admin/dashboard"
  }

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    const formData = new FormData(e.currentTarget)
    const username = formData.get("username") as string
    const password = formData.get("password") as string

    try {
      const result = await login(username, password)

      if (result.success) {
        router.push(getNextPath())
      } else {
        setError(result.error || "Invalid username or password")
      }
    } catch (err) {
      setError("An error occurred during login")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-[#0F271C] to-black px-4 py-10">
      <LoginParticles />
      <Card className="relative z-10 w-full max-w-md shadow-2xl shadow-black/50">
        <CardHeader className="items-center text-center space-y-3 pb-4">
          <img
            src="/logos/club/htm-logo-official.png"
            alt="FK Hånd til Munn logo"
            className="h-24 w-24 object-contain"
          />
          <div className="space-y-1">
            <CardTitle className="text-2xl tracking-wide">FK HÅND TIL MUNN</CardTitle>
            <CardDescription>Log in to access team information</CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="username"
                  name="username"
                  placeholder="Enter your username"
                  autoComplete="username"
                  className="pl-10"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  className="pl-10"
                  required
                />
              </div>
            </div>
            {notice && !error && (
              <p className="rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800" role="status">
                {notice}
              </p>
            )}
            {error && (
              <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600" role="alert">
                {error}
              </p>
            )}
            <Button type="submit" className="w-full bg-black" disabled={isLoading}>
              {isLoading ? "Logging in..." : "Log in"}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="justify-center border-t pt-4">
          <Button variant="ghost" size="sm" asChild className="text-gray-600">
            <Link href="/">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to home
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
