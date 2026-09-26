import { TeamLogo } from "@/components/admin/team-logo"

interface MatchupProps {
  homeName: string
  homeLogo: string | null
  awayName: string
  awayLogo: string | null
  size?: number
  /** One team per line (home above away), for narrow screens. */
  stacked?: boolean
}

// "[logo] Home vs Away [logo]", as used on the admin match cards.
export function Matchup({ homeName, homeLogo, awayName, awayLogo, size = 28, stacked = false }: MatchupProps) {
  if (stacked) {
    return (
      <span className="flex flex-col gap-1 min-w-0">
        <span className="flex items-center gap-2 min-w-0">
          <TeamLogo url={homeLogo} name={homeName} size={size} />
          <span className="font-semibold truncate">{homeName}</span>
        </span>
        {/* Lined up under the names, past the logo column */}
        <span className="text-xs text-gray-400" style={{ paddingLeft: size + 8 }}>
          vs
        </span>
        <span className="flex items-center gap-2 min-w-0">
          <TeamLogo url={awayLogo} name={awayName} size={size} />
          <span className="font-semibold truncate">{awayName}</span>
        </span>
      </span>
    )
  }

  return (
    <span className="flex items-center gap-2 min-w-0">
      <TeamLogo url={homeLogo} name={homeName} size={size} />
      <span className="font-semibold truncate">{homeName}</span>
      <span className="text-gray-400 font-normal text-sm px-1 shrink-0">vs</span>
      <span className="font-semibold truncate">{awayName}</span>
      <TeamLogo url={awayLogo} name={awayName} size={size} />
    </span>
  )
}
