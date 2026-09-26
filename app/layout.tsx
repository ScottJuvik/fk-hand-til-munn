import type React from "react"
import "@/app/globals.css"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import Navbar from "@/components/navbar"
import { Footer } from "@/components/footer"
import { AuthProvider } from "@/components/auth-provider"
import { ScrollToTop } from "@/components/scroll-to-top"
import { Toaster } from "@/components/ui/toaster"
import { cookies } from "next/headers"
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth"
import { INTRO_SEEN_SCRIPT } from "@/lib/intro-seen"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "FK Hånd til Munn",
  description: "Official website of FK Hånd til Munn",
    generator: 'v0.app',
  icons: {
    icon: "/logos/club/htm-logo-round.png",
    apple: "/logos/club/htm-logo-round.png",
  },
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // Read the session server-side so the navbar and admin pages know the
  // role on first render (the cookie itself is httpOnly).
  const session = await verifySessionToken(cookies().get(SESSION_COOKIE)?.value)

  return (
    // The intro script adds an attribute to <html> before React hydrates.
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: INTRO_SEEN_SCRIPT }} />
      </head>
      <body className={inter.className}>
        <AuthProvider initialSession={session}>
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
            <ScrollToTop>
              <Navbar />
              <main>{children}</main>
              <Footer />
              <Toaster />
            </ScrollToTop>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
