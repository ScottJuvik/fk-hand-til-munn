import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

const supabase = createServerSupabaseClient()

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const matchId = params.id
    const { homeScore, awayScore, played } = await request.json()

    // Update match
    const { data: match, error: matchError } = await supabase
      .from("matches")
      .update({
        home_score: homeScore,
        away_score: awayScore,
        played: played,
        updated_at: new Date().toISOString(),
      })
      .eq("id", matchId)
      .select("*, league:league_id(*), home_team:home_team_id(*), away_team:away_team_id(*)")
      .single()

    if (matchError) {
      return NextResponse.json({ error: `Error updating match: ${matchError.message}` }, { status: 500 })
    }

    // Recalculate standings for the league
    if (match && match.league) {
      // Get all matches in the league
      const { data: leagueMatches, error: leagueMatchesError } = await supabase
        .from("matches")
        .select("*, home_team:home_team_id(*), away_team:away_team_id(*)")
        .eq("league_id", match.league.id)

      if (leagueMatchesError) {
        return NextResponse.json(
          { error: `Error fetching league matches: ${leagueMatchesError.message}` },
          { status: 500 },
        )
      }

      // Calculate standings
      const teamStats: Record<number, any> = {}

      // Process all played matches
      leagueMatches
        .filter((m) => m.played)
        .forEach((m) => {
          const homeTeamId = m.home_team.id
          const awayTeamId = m.away_team.id

          // Initialize teams if they don't exist
          if (!teamStats[homeTeamId]) {
            teamStats[homeTeamId] = {
              team_id: homeTeamId,
              played: 0,
              won: 0,
              drawn: 0,
              lost: 0,
              goals_for: 0,
              goals_against: 0,
              goal_difference: 0,
              points: 0,
            }
          }

          if (!teamStats[awayTeamId]) {
            teamStats[awayTeamId] = {
              team_id: awayTeamId,
              played: 0,
              won: 0,
              drawn: 0,
              lost: 0,
              goals_for: 0,
              goals_against: 0,
              goal_difference: 0,
              points: 0,
            }
          }

          // Update home team stats
          teamStats[homeTeamId].played += 1
          teamStats[homeTeamId].goals_for += m.home_score || 0
          teamStats[homeTeamId].goals_against += m.away_score || 0

          // Update away team stats
          teamStats[awayTeamId].played += 1
          teamStats[awayTeamId].goals_for += m.away_score || 0
          teamStats[awayTeamId].goals_against += m.home_score || 0

          // Determine match result and update accordingly
          if (m.home_score !== null && m.away_score !== null) {
            if (m.home_score > m.away_score) {
              // Home win
              teamStats[homeTeamId].won += 1
              teamStats[homeTeamId].points += 3
              teamStats[awayTeamId].lost += 1
            } else if (m.home_score < m.away_score) {
              // Away win
              teamStats[awayTeamId].won += 1
              teamStats[awayTeamId].points += 3
              teamStats[homeTeamId].lost += 1
            } else {
              // Draw
              teamStats[homeTeamId].drawn += 1
              teamStats[homeTeamId].points += 1
              teamStats[awayTeamId].drawn += 1
              teamStats[awayTeamId].points += 1
            }
          }
        })

      // A team whose only played match(es) just got deleted or reverted to
      // unplayed won't appear in teamStats above (it has zero played
      // matches now), so the upsert loop below would never touch its
      // existing standings row and it'd be stuck showing stale numbers
      // forever. Zero out any such team explicitly.
      const { data: existingStandings, error: existingStandingsError } = await supabase
        .from("standings")
        .select("team_id")
        .eq("league_id", match.league.id)

      if (existingStandingsError) {
        return NextResponse.json(
          { error: `Error fetching existing standings: ${existingStandingsError.message}` },
          { status: 500 },
        )
      }

      for (const row of existingStandings || []) {
        if (!teamStats[row.team_id]) {
          teamStats[row.team_id] = {
            team_id: row.team_id,
            played: 0,
            won: 0,
            drawn: 0,
            lost: 0,
            goals_for: 0,
            goals_against: 0,
            goal_difference: 0,
            points: 0,
          }
        }
      }

      // Calculate goal differences
      Object.values(teamStats).forEach((team) => {
        team.goal_difference = team.goals_for - team.goals_against
      })

      // Sort teams by points, goal difference, goals scored
      const sortedTeams = Object.values(teamStats).sort((a, b) => {
        if (a.points !== b.points) return b.points - a.points
        if (a.goal_difference !== b.goal_difference) return b.goal_difference - a.goal_difference
        return b.goals_for - a.goals_for
      })

      // Assign positions and qualification groups
      sortedTeams.forEach((team, index) => {
        team.position = index + 1

        // Assign qualification groups based on position
        if (match.league.name === "Avdeling A") {
          if (index < 3) team.qualification_group = "A-sluttspill"
          else if (index < 6) team.qualification_group = "B-sluttspill"
          else if (index < 9) team.qualification_group = "C-sluttspill"
          else team.qualification_group = "D-sluttspill"
        } else {
          team.qualification_group = null
        }
      })

      // Update standings in the database
      for (const team of sortedTeams) {
        const { error: standingError } = await supabase.from("standings").upsert(
          {
            league_id: match.league.id,
            team_id: team.team_id,
            position: team.position,
            played: team.played,
            won: team.won,
            drawn: team.drawn,
            lost: team.lost,
            goals_for: team.goals_for,
            goals_against: team.goals_against,
            goal_difference: team.goal_difference,
            points: team.points,
            qualification_group: team.qualification_group,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "league_id,team_id" },
        )

        if (standingError) {
          return NextResponse.json({ error: `Error updating standings: ${standingError.message}` }, { status: 500 })
        }
      }
    }

    return NextResponse.json({ success: true, match })
  } catch (error: any) {
    return NextResponse.json({ error: `Error processing request: ${error.message}` }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const matchId = params.id

    const { error } = await supabase.from("matches").delete().eq("id", matchId)

    if (error) {
      return NextResponse.json({ error: `Error deleting match: ${error.message}` }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: `Error processing request: ${error.message}` }, { status: 500 })
  }
}
