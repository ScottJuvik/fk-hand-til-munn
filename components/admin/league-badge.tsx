import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

// One colour per league name, so divisions are easy to tell apart.
// Avoid green: the "Played" badge next to these is already green.
// Seasons of the same division (e.g. Avdeling A 2024 and 2026) share a colour.
const LEAGUE_COLORS: Record<string, string> = {
  "Avdeling A": "bg-blue-100 text-blue-700 hover:bg-blue-100",
  "Avdeling B": "bg-violet-100 text-violet-700 hover:bg-violet-100",
  "C-sluttspill": "bg-amber-100 text-amber-800 hover:bg-amber-100",
}

// Any league not listed above still gets a stable colour from this list.
const FALLBACK_COLORS = [
  "bg-indigo-100 text-indigo-700 hover:bg-indigo-100",
  "bg-rose-100 text-rose-700 hover:bg-rose-100",
  "bg-cyan-100 text-cyan-800 hover:bg-cyan-100",
  "bg-orange-100 text-orange-800 hover:bg-orange-100",
]

function leagueColor(name: string) {
  if (LEAGUE_COLORS[name]) return LEAGUE_COLORS[name]
  const hash = Array.from(name).reduce((sum, ch) => sum + ch.charCodeAt(0), 0)
  return FALLBACK_COLORS[hash % FALLBACK_COLORS.length]
}

export function LeagueBadge({ name, className }: { name: string; className?: string }) {
  return <Badge className={cn(leagueColor(name), className)}>{name}</Badge>
}

// Section divider shown where a list moves on to a different league:
// the league badge and season, followed by a line across the rest.
export function LeagueDivider({ name, year, first = false }: { name: string; year?: number | null; first?: boolean }) {
  return (
    <div className={cn("flex items-center gap-3", first ? "pb-1" : "pt-6 pb-1")}>
      <LeagueBadge name={name} />
      {year ? <span className="text-sm font-medium text-gray-500">{year}</span> : null}
      <div className="h-px flex-1 bg-gray-300" />
    </div>
  )
}
