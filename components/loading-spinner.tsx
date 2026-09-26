'use client'

import { Spinner } from '@/components/ui/spinner'
import { cn } from '@/lib/utils'

interface LoadingSpinnerProps {
  // What is loading, shown after the spinner (e.g. "Loading players").
  label?: string
  // Fill the screen (page loads) or just the surrounding box (sections).
  fullScreen?: boolean
}

export function LoadingSpinner({ label, fullScreen = true }: LoadingSpinnerProps) {
  return (
    <div className={cn('flex items-center justify-center gap-3', fullScreen ? 'min-h-screen' : 'py-6')}>
      <Spinner className="size-8" />
      {label && <span className="text-lg text-gray-600">{label}</span>}
    </div>
  )
}
