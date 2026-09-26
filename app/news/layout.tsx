import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "News | FK Hånd til Munn",
  description: "Latest news and updates from FK Hånd til Munn football club",
}

export default function NewsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">{children}</div>
    </div>
  )
}
