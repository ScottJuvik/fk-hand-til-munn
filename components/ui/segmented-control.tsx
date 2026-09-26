"use client"

import { cn } from "@/lib/utils"
import { SlidingIndicator } from "@/components/ui/sliding-indicator"

interface SegmentedControlProps<T extends string> {
  options: { value: T; label: string }[]
  value: T
  onChange: (value: T) => void
  className?: string
  /** Extra classes for each option button. */
  itemClassName?: string
  "aria-label"?: string
}

/**
 * A row of toggle buttons where the black highlight slides to the chosen one.
 * The row may wrap onto several lines; the highlight follows it there too.
 */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  className,
  itemClassName,
  "aria-label": ariaLabel,
}: SegmentedControlProps<T>) {
  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className={cn("relative inline-flex flex-wrap gap-1 rounded-md border bg-white p-1", className)}
    >
      <SlidingIndicator className="rounded bg-gray-900 shadow-sm" />
      {options.map((option) => {
        const active = option.value === value
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            data-state={active ? "active" : "inactive"}
            onClick={() => onChange(option.value)}
            className={cn(
              "relative z-10 h-9 rounded px-3 text-sm font-medium transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2",
              active ? "text-white" : "text-gray-600 hover:text-gray-900",
              itemClassName,
            )}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
