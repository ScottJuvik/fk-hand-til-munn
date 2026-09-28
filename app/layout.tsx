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
import { Analytics } from "@vercel/analytics/next"
import { SITE_NAME, SITE_URL } from "@/lib/site"

const inter = Inter({ subsets: ["latin"] })

// The icons come from app/favicon.ico, app/icon.png and app/apple-icon.png,
// which Next.js links with their sizes (what Google needs for the icon next
// to the site in search results).
export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: SITE_NAME,
  description: "Official website of FK Hånd til Munn",
    generator: 'v0.app',
}

// Tells search engines the site's name and logo (shown next to it in results).
const STRUCTURED_DATA = [
  { "@context": "https://schema.org", "@type": "WebSite", name: SITE_NAME, url: SITE_URL },
  {
    "@context": "https://schema.org",
    "@type": "SportsTeam",
    name: SITE_NAME,
    sport: "Soccer",
    url: SITE_URL,
    logo: `${SITE_URL}/logos/club/htm-logo-round.png`,
  },
]

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
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(STRUCTURED_DATA) }} />
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
        <Analytics />
      </body>
    </html>
  )
}
