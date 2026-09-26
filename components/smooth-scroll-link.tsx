"use client"

import type { ComponentProps } from "react"

// In-page anchor that scrolls smoothly to its target. `scroll-smooth` on an
// inner element does nothing because the window is what scrolls, and setting
// it on <html> would make every anchor on the site smooth.
export function SmoothScrollLink({ href, onClick, ...props }: ComponentProps<"a"> & { href: `#${string}` }) {
  return (
    <a
      href={href}
      onClick={(event) => {
        onClick?.(event)
        const target = document.getElementById(href.slice(1))
        if (!target || event.defaultPrevented) return
        event.preventDefault()
        // Respects the target's scroll-margin (scroll-mt-*) so the header doesn't cover it.
        target.scrollIntoView({ behavior: "smooth", block: "start" })
        history.replaceState(null, "", href)
      }}
      {...props}
    />
  )
}
