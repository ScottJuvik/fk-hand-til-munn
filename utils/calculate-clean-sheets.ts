interface MatchLike {
  played: boolean
  homeTeamId: number
  awayTeamId: number
  homeScore: number | null
  awayScore: number | null
}

// A clean sheet is a played match where the opponent didn't score against
// `teamId`. League standings don't carry this, so it has to be derived from
// the individual match results.
export function calculateCleanSheets(matches: MatchLike[] | undefined, teamId: number): number {
  if (!matches) return 0

  return matches.filter((match) => {
    if (!match.played) return false
    if (match.homeTeamId === teamId) return match.awayScore === 0
    if (match.awayTeamId === teamId) return match.homeScore === 0
    return false
  }).length
}
