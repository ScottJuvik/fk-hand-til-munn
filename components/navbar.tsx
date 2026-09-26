"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, X, LogIn, LogOut, Music, Home, Users, BarChart3, UserRound, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useAuth } from "@/components/auth-provider"

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { userRole, logout } = useAuth()

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center">
            <img
              src="/logos/club/htm-logo.jpg"
              alt="FK Hånd til Munn Logo"
              className="h-8 w-8 rounded-full object-cover mr-2"
            />
            <span className="font-bold text-xl">FK HÅND TIL MUNN</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-gray-700 hover:text-black font-medium flex items-center">
              <Home className="h-4 w-4 mr-1" />
              Home
            </Link>
            <Link href="/lineup" className="text-gray-700 hover:text-black font-medium flex items-center">
              <Users className="h-4 w-4 mr-1" />
              Lineup
            </Link>
            <Link href="/players" className="text-gray-700 hover:text-black font-medium flex items-center">
              <UserRound className="h-4 w-4 mr-1" />
              Players
            </Link>
            <Link href="/statistics" className="text-gray-700 hover:text-black font-medium flex items-center">
              <BarChart3 className="h-4 w-4 mr-1" />
              Statistics
            </Link>
            <Link href="/band" className="text-gray-700 hover:text-black font-medium flex items-center">
              <Music className="h-4 w-4 mr-1" />
              Band
            </Link>
            {userRole === "admin" && (
              <Link href="/admin/dashboard" className="text-gray-700 hover:text-black font-medium flex items-center">
                <Shield className="h-4 w-4 mr-1" />
                Admin
              </Link>
            )}
            {userRole ? (
              <Button onClick={logout} className="bg-black text-white hover:bg-gray-800">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            ) : (
              <Button asChild className="bg-black text-white hover:bg-gray-800">
                <Link href="/login">
                  <LogIn className="h-4 w-4 mr-2" />
                  Login
                </Link>
              </Button>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          >
            {isMenuOpen ? <X className="h-6 w-6 text-black" /> : <Menu className="h-6 w-6 text-black" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Backdrop */}
      {isMenuOpen && (
<div
  className="md:hidden fixed inset-0 bg-transparent z-30"
  onClick={() => setIsMenuOpen(false)}
/>

      )}

      {/* Mobile Navigation */}
<div
  className={cn(
    "md:hidden fixed right-0 top-16 w-full max-h-[calc(100vh-4rem)] bg-white z-40 px-4 py-4 shadow-lg transition-all duration-300 ease-in-out transform overflow-y-auto",
    isMenuOpen ? "translate-x-0" : "translate-x-full pointer-events-none"
  )}
>
        <nav className="flex flex-col">
          <Link
            href="/"
            className="text-base font-medium flex items-center gap-3 py-3 px-2 rounded-md hover:bg-gray-100"
            onClick={() => setIsMenuOpen(false)}
          >
            <Home className="h-5 w-5 text-gray-500" />
            Home
          </Link>
          <Link
            href="/lineup"
            className="text-base font-medium flex items-center gap-3 py-3 px-2 rounded-md hover:bg-gray-100"
            onClick={() => setIsMenuOpen(false)}
          >
            <Users className="h-5 w-5 text-gray-500" />
            Lineup
          </Link>
          <Link
            href="/players"
            className="text-base font-medium flex items-center gap-3 py-3 px-2 rounded-md hover:bg-gray-100"
            onClick={() => setIsMenuOpen(false)}
          >
            <UserRound className="h-5 w-5 text-gray-500" />
            Players
          </Link>
          <Link
            href="/statistics"
            className="text-base font-medium flex items-center gap-3 py-3 px-2 rounded-md hover:bg-gray-100"
            onClick={() => setIsMenuOpen(false)}
          >
            <BarChart3 className="h-5 w-5 text-gray-500" />
            Statistics
          </Link>
          <Link
            href="/band"
            className="text-base font-medium flex items-center gap-3 py-3 px-2 rounded-md hover:bg-gray-100"
            onClick={() => setIsMenuOpen(false)}
          >
            <Music className="h-5 w-5 text-gray-500" />
            Band
          </Link>
          {userRole === "admin" && (
            <Link
              href="/admin/dashboard"
              className="text-base font-medium flex items-center gap-3 py-3 px-2 rounded-md hover:bg-gray-100"
              onClick={() => setIsMenuOpen(false)}
            >
              <Shield className="h-5 w-5 text-gray-500" />
              Admin
            </Link>
          )}

          <div className="pt-3 mt-2 border-t border-gray-200">
            {userRole ? (
              <Button
                onClick={() => {
                  logout()
                  setIsMenuOpen(false)
                }}
                className="bg-black text-white hover:bg-gray-800 w-full"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            ) : (
              <Button
                asChild
                className="bg-black text-white hover:bg-gray-800 w-full"
                onClick={() => setIsMenuOpen(false)}
              >
                <Link href="/login">
                  <LogIn className="h-4 w-4 mr-2" />
                  Login
                </Link>
              </Button>
            )}
          </div>
        </nav>
      </div>
    </header>
  )
}
