"use client"

import { type RefObject, useLayoutEffect, useState } from "react"

import { cn } from "@/lib/utils"

interface Rect {
  left: number
  top: number
  width: number
  height: number
}

/**
 * Tracks where the active option (`data-state="active"`) sits inside a toggle
 * group, so a highlight can slide to it. Re-measures when the active option
 * changes and when the group resizes or wraps.
 */
function useActiveRect(container: RefObject<HTMLElement | null>) {
  const [rect, setRect] = useState<Rect | null>(null)

  useLayoutEffect(() => {
    const el = container.current
    if (!el) return
    const measure = () => {
      const active = el.querySelector<HTMLElement>('[data-state="active"]')
      setRect(
        active
          ? { left: active.offsetLeft, top: active.offsetTop, width: active.offsetWidth, height: active.offsetHeight }
          : null,
      )
    }
    measure()
    const resize = new ResizeObserver(measure)
    resize.observe(el)
    const states = new MutationObserver(measure)
    states.observe(el, { attributes: true, subtree: true, attributeFilter: ["data-state"] })
    return () => {
      resize.disconnect()
      states.disconnect()
    }
  }, [container])

  return rect
}

/**
 * The highlight behind the active option of a toggle group. Put it inside the
 * group (which must be `relative`) and give the options `relative z-10`.
 * It jumps into place on first render, then glides between options.
 */
export function SlidingIndicator({ container, className }: { container: RefObject<HTMLElement | null>; className?: string }) {
  const rect = useActiveRect(container)
  const [placed, setPlaced] = useState(false)

  useLayoutEffect(() => {
    if (!rect || placed) return
    // Let the first position paint without a transition, then animate from there on.
    // A timer rather than requestAnimationFrame, which never fires in a background tab.
    const timer = setTimeout(() => setPlaced(true), 50)
    return () => clearTimeout(timer)
  }, [rect, placed])

  return (
    <span
      aria-hidden
      className={cn(
        "pointer-events-none absolute z-0",
        placed && "transition-all duration-300 ease-out motion-reduce:transition-none",
        className,
      )}
      style={rect ? { left: rect.left, top: rect.top, width: rect.width, height: rect.height } : { opacity: 0 }}
    />
  )
}
