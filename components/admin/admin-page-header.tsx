import type { ReactNode } from "react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

interface AdminPageHeaderProps {
  title: ReactNode
  backHref: string
  /** Where the back link goes, e.g. "Dashboard" (shown on phones). */
  backLabel: string
  /** Optional button on the right, e.g. "Add Player". */
  action?: ReactNode
}

// Title row for admin pages. Desktop: back button beside the title. Phones: a
// small back link above it, so the title gets the full row instead of wrapping.
export function AdminPageHeader({ title, backHref, backLabel, action }: AdminPageHeaderProps) {
  return (
    <div className="mb-6">
      <Link
        href={backHref}
        className="md:hidden mb-2 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900"
      >
        <ArrowLeft className="h-4 w-4" />
        {backLabel}
      </Link>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center min-w-0">
          <Button variant="outline" size="icon" className="mr-2 hidden md:inline-flex shrink-0" asChild>
            <Link href={backHref} aria-label={`Back to ${backLabel}`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">{title}</h1>
        </div>
        {action}
      </div>
    </div>
  )
}
