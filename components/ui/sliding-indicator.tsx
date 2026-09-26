"use client"

import { type RefObject, useLayoutEffect, useRef, useState } from "react"

import { cn } from "@/lib/utils"

interface Rect {
  left: number
  top: number
  width: number
  height: number
}

/**
 * Tracks where the active option (`data-state="active"`) sits inside the toggle
 * group containing `indicator`, so the highlight can slide to it. Re-measures
 * when the active option changes and when the group resizes or wraps.
 *
 * The group is found as the indicator's parent element: a ref on the group
 * itself isn't attached yet when this first runs (parents get their refs after
 * their children's effects), which left the highlight unmeasured in production.
 */
function useActiveRect(indicator: RefObject<HTMLElement | null>) {
  const [rect, setRect] = useState<Rect | null>(null)

  useLayoutEffect(() => {
    const el = indicator.current?.parentElement
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
  }, [indicator])

  return rect
}

/**
 * The highlight behind the active option of a toggle group. Put it inside the
 * group (which must be `relative`) and give the options `relative z-10`.
 * It jumps into place on first render, then glides between options.
 */
export function SlidingIndicator({ className }: { className?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const rect = useActiveRect(ref)
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
      ref={ref}
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
