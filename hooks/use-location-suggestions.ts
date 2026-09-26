"use client"

import { useEffect, useState } from "react"
import { adminGetLocationSuggestions } from "@/actions/admin-data"

// Venues previously used for matches, most-used first. Grouped
// case-insensitively, keeping the most common spelling of each.
export function useLocationSuggestions() {
  const [suggestions, setSuggestions] = useState<string[]>([])

  useEffect(() => {
    let cancelled = false
    adminGetLocationSuggestions()
      .then((ranked) => {
        if (!cancelled) setSuggestions(ranked)
      })
      .catch((error) => console.error("Error fetching locations:", error))
    return () => {
      cancelled = true
    }
  }, [])

  return suggestions
}
