import type { ReactNode } from "react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

interface AdminPageHeaderProps {
  title: ReactNode
  backHref: string
  /** Where the back link goes, e.g. "Dashboard". */
  backLabel: string
  /** Optional button on the right, e.g. "Add Player". */
  action?: ReactNode
}

// Title row for admin pages: a small back link above the title (e.g. "← Dashboard"),
// so the title gets the full row, with an optional action button on the right.
export function AdminPageHeader({ title, backHref, backLabel, action }: AdminPageHeaderProps) {
  return (
    <div className="mb-6">
      <Link
        href={backHref}
        className="mb-2 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900"
      >
        <ArrowLeft className="h-4 w-4" />
        {backLabel}
      </Link>
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold min-w-0">{title}</h1>
        {action}
      </div>
    </div>
  )
}
