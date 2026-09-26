"use client"

import { useState } from "react"

interface TeamLogoProps {
  url?: string | null
  name: string
  size?: number
}

// Fixed-size regardless of the team name, so rows of these never shift
// around the way name-driven labels do.
export function TeamLogo({ url, name, size = 24 }: TeamLogoProps) {
  const [errored, setErrored] = useState(false)
  const dimension = `${size}px`

  if (!url || errored) {
    return (
      <div
        className="flex items-center justify-center rounded-full bg-gray-200 text-gray-600 font-semibold shrink-0"
        style={{ width: dimension, height: dimension, fontSize: size * 0.4 }}
      >
        {name.slice(0, 2).toUpperCase()}
      </div>
    )
  }

  return (
    <img
      src={url}
      alt={name}
      className="rounded-full object-cover shrink-0 bg-white border"
      style={{ width: dimension, height: dimension }}
      onError={() => setErrored(true)}
    />
  )
}
