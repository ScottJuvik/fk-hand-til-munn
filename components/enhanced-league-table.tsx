import type { TeamStanding } from "@/actions/get-league-data"
import Image from "next/image"

interface EnhancedLeagueTableProps {
  standings: TeamStanding[]
  ourTeam?: string
  leagueName?: string
  /** Shown under the table, e.g. how a tie on points was decided. */
  note?: string
}

export function EnhancedLeagueTable({ standings, ourTeam, leagueName, note }: EnhancedLeagueTableProps) {
  const sortedStandings = [...standings].sort((a, b) => a.position - b.position)

  const getPositionColor = (position: number) => {
    if (position <= 2) return "#6ee7a0" // A-sluttspill — green
    if (position <= 4) return "#7fb0f5" // B-sluttspill — blue
    if (position <= 6) return "#c9a0f0" // C-sluttspill — purple
    if (position <= 8) return "#f5b184" // D-sluttspill — orange
    return "#f29a9a" // E-sluttspill — red
  }

  const isAvdelingA = leagueName === "Avdeling A"
  const isAvdelingB = leagueName === "Avdeling B"

  return (
    <div className="w-full">
      {/* Desktop full table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full bg-white shadow-md rounded-lg overflow-hidden">
          <thead className="bg-black text-white">
            <tr>
              <th className="py-3 px-4 text-left">Pos</th>
              <th className="py-3 px-4 text-left">Team</th>
              <th className="py-3 px-4 text-center">P</th>
              <th className="py-3 px-4 text-center">W</th>
              <th className="py-3 px-4 text-center">D</th>
              <th className="py-3 px-4 text-center">L</th>
              <th className="py-3 px-4 text-center">GF</th>
              <th className="py-3 px-4 text-center">GA</th>
              <th className="py-3 px-4 text-center">GD</th>
              <th className="py-3 px-4 text-center">Pts</th>
            </tr>
          </thead>
          <tbody>
            {sortedStandings.map((team) => {
              const isOurTeam = team.teamName === ourTeam || team.teamName.includes("FK Hånd til Munn")
              const showClassification = isAvdelingA || isAvdelingB

              return (
                <tr key={team.teamId} className={isOurTeam ? "font-bold bg-gray-100" : "hover:bg-gray-50"}>
                  <td
                    className="py-3 px-4 border-b"
                    style={showClassification ? { boxShadow: `inset 5px 0 0 0 ${getPositionColor(team.position)}` } : undefined}
                  >
                    {team.position}
                  </td>
                  <td className="py-3 px-4 border-b">
                    <div className="flex items-center">
                      {team.teamLogo && (
                        <div className="w-6 h-6 mr-2 relative flex-shrink-0">
                          <Image
                            src={team.teamLogo || "/placeholder.svg"}
                            alt={team.teamName}
                            width={24}
                            height={24}
                            className="object-contain"
                          />
                        </div>
                      )}
                      {team.teamName}
                    </div>
                  </td>
                  <td className="py-3 px-4 border-b text-center">{team.played}</td>
                  <td className="py-3 px-4 border-b text-center">{team.won}</td>
                  <td className="py-3 px-4 border-b text-center">{team.drawn}</td>
                  <td className="py-3 px-4 border-b text-center">{team.lost}</td>
                  <td className="py-3 px-4 border-b text-center">{team.goalsFor}</td>
                  <td className="py-3 px-4 border-b text-center">{team.goalsAgainst}</td>
                  <td className="py-3 px-4 border-b text-center">
                    {team.goalDifference > 0 ? "+" : ""}
                    {team.goalDifference}
                  </td>
                  <td className="py-3 px-4 border-b text-center">{team.points}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile compact Futmob style */}
      <div className="block md:hidden">
        <table className="w-full bg-white shadow-md rounded-lg overflow-hidden text-sm">
          <thead className="bg-black text-white">
            <tr>
              <th className="py-2 px-2 text-left">#</th>
              <th className="py-2 px-2 text-left">Team</th>
              <th className="py-2 px-2 text-center">P</th>
              <th className="py-2 px-2 text-center">GD</th>
              <th className="py-2 px-2 text-center">Pts</th>
            </tr>
          </thead>
          <tbody>
            {sortedStandings.map((team) => {
              const isOurTeam = team.teamName === ourTeam || team.teamName.includes("FK Hånd til Munn")
              const showClassification = isAvdelingA || isAvdelingB

              return (
                <tr key={team.teamId} className={isOurTeam ? "font-bold bg-gray-100" : "hover:bg-gray-50"}>
                  <td
                    className="py-2 px-2 border-b"
                    style={showClassification ? { boxShadow: `inset 4px 0 0 0 ${getPositionColor(team.position)}` } : undefined}
                  >
                    {team.position}
                  </td>
                  <td className="py-2 px-2 border-b">
                    <div className="flex items-center">
                      {team.teamLogo && (
                        <div className="w-5 h-5 mr-2 relative flex-shrink-0">
                          <Image
                            src={team.teamLogo || "/placeholder.svg"}
                            alt={team.teamName}
                            width={20}
                            height={20}
                            className="object-contain"
                          />
                        </div>
                      )}
                      {team.teamName}
                    </div>
                  </td>
                  <td className="py-2 px-2 border-b text-center">{team.played}</td>
                  <td className="py-2 px-2 border-b text-center">
                    {team.goalDifference > 0 ? "+" : ""}
                    {team.goalDifference}
                  </td>
                  <td className="py-2 px-2 border-b text-center">{team.points}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {(isAvdelingA || isAvdelingB) && (
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-4 px-1 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: "#6ee7a0" }} />
            A-sluttspill
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: "#7fb0f5" }} />
            B-sluttspill
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: "#c9a0f0" }} />
            C-sluttspill
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: "#f5b184" }} />
            D-sluttspill
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: "#f29a9a" }} />
            E-sluttspill
          </div>
        </div>
      )}

      {note && <p className="mt-3 px-1 text-sm italic text-gray-600">{note}</p>}
    </div>
  )
}
