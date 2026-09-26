"use client"

import type React from "react"

import { usePathname } from "next/navigation"
import { useLayoutEffect } from "react"

export function ScrollToTop({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  useLayoutEffect(() => {
    // A link to an in-page anchor (e.g. /about#values) should scroll to that
    // section, not get overridden back to the top of the page. The target
    // section can still be mid-navigation/not yet painted at this point, so
    // retry across a few frames instead of giving up after a single check.
    const hash = window.location.hash
    if (hash) {
      // Keep re-correcting for a bit, not just until the element first
      // appears: images/fonts still settling in shift page height right
      // after navigation, which would throw off a one-shot scrollIntoView
      // taken before layout has stabilized. setTimeout rather than
      // requestAnimationFrame so this still runs if the tab isn't focused
      // (e.g. a link opened into a background tab), since rAF can be
      // paused entirely while a tab is hidden.
      const delays = [0, 50, 100, 200, 350, 500]
      const timers = delays.map((delay) =>
        setTimeout(() => {
          document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: "instant" as ScrollBehavior })
        }, delay),
      )
      return () => timers.forEach(clearTimeout)
    }
    window.scrollTo({ top: 0, left: 0, behavior: "instant" })
  }, [pathname])

  return <>{children}</>
}
