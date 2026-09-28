"use server"

import { createServerSupabaseClient } from "@/lib/supabase"

const supabase = createServerSupabaseClient()

const OUR_TEAM_ID = 1
const OUR_TEAM_LOGO = "/logos/club/htm-logo-official.png"

export interface TeamStanding {
  position: number
  teamId: number
  teamName: string
  teamLogo: string | null
  played: number
  won: number
  drawn: number
  lost: number
  goalsFor: number
  goalsAgainst: number
  goalDifference: number
  points: number
  qualificationGroup: string | null
}

export interface MatchData {
  id: number
  week: number
  date: string
  time: string
  homeTeam: string
  homeTeamId: number
  homeTeamLogo: string | null
  awayTeam: string
  awayTeamId: number
  awayTeamLogo: string | null
  homeScore: number | null
  awayScore: number | null
  location: string
  played: boolean
}

export interface LeagueData {
  id: number
  name: string
  season: string
  type: string
  standings: TeamStanding[]
  matches: MatchData[]
  lastUpdated: string
}

// Calculate dynamic standings for Avdeling B
async function calculateDynamicStandings(leagueId: number): Promise<TeamStanding[]> {
  try {
    // Get all teams in the league
    const { data: standingsData, error: standingsError } = await supabase
      .from("standings")
      .select(`
        team_id,
        teams:team_id(id, name, logo_url)
      `)
      .eq("league_id", leagueId)

    if (standingsError) {
      console.error(`Error fetching teams: ${standingsError.message}`)
      return []
    }

    // Get all matches for the league
    const { data: matchesData, error: matchesError } = await supabase
      .from("matches")
      .select(`
        home_team_id,
        away_team_id,
        home_score,
        away_score,
        played
      `)
      .eq("league_id", leagueId)
      .eq("played", true)

    if (matchesError) {
      console.error(`Error fetching matches: ${matchesError.message}`)
      return []
    }

    // Calculate stats for each team
    const teamStats = new Map()

    // Initialize all teams
    standingsData.forEach((standing) => {
      teamStats.set(standing.team_id, {
        teamId: standing.team_id,
        teamName: standing.teams.name,
        teamLogo: standing.team_id === OUR_TEAM_ID ? OUR_TEAM_LOGO : standing.teams.logo_url,
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        goalDifference: 0,
        points: 0,
        qualificationGroup: null,
      })
    })

    // Process matches
    matchesData.forEach((match) => {
      if (match.home_score !== null && match.away_score !== null) {
        const homeTeam = teamStats.get(match.home_team_id)
        const awayTeam = teamStats.get(match.away_team_id)

        if (homeTeam && awayTeam) {
          // Update played games
          homeTeam.played++
          awayTeam.played++

          // Update goals
          homeTeam.goalsFor += match.home_score
          homeTeam.goalsAgainst += match.away_score
          awayTeam.goalsFor += match.away_score
          awayTeam.goalsAgainst += match.home_score

          // Determine result
          if (match.home_score > match.away_score) {
            // Home win
            homeTeam.won++
            homeTeam.points += 3
            awayTeam.lost++
          } else if (match.home_score < match.away_score) {
            // Away win
            awayTeam.won++
            awayTeam.points += 3
            homeTeam.lost++
          } else {
            // Draw
            homeTeam.drawn++
            homeTeam.points += 1
            awayTeam.drawn++
            awayTeam.points += 1
          }

          // Update goal difference
          homeTeam.goalDifference = homeTeam.goalsFor - homeTeam.goalsAgainst
          awayTeam.goalDifference = awayTeam.goalsFor - awayTeam.goalsAgainst
        }
      }
    })

    // Convert to array and sort by points, then goal difference, then goals for
    const standings = Array.from(teamStats.values()).sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points
      if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference
      return b.goalsFor - a.goalsFor
    })

    // Add positions
    standings.forEach((team, index) => {
      team.position = index + 1
    })

    return standings
  } catch (error) {
    console.error("Error calculating dynamic standings:", error)
    return []
  }
}

// -----------------------
// Get all leagues
// -----------------------
export async function getAllLeagues() {
  try {
    const { data: leagues, error } = await supabase.from("leagues").select("*").order("name")
    if (error) {
      console.error(`Error fetching leagues: ${error.message}`)
      return []
    }
    return leagues
  } catch (error) {
    console.error("Error in getAllLeagues:", error)
    return []
  }
}

// -----------------------
// Get league by name
// -----------------------
export async function getLeagueByName(leagueName: string): Promise<LeagueData | null> {
  try {
    const { data: league, error: leagueError } = await supabase
      .from("leagues")
      .select("*")
      .eq("name", leagueName)
      .single()

    if (leagueError) {
      console.error(`Error fetching league: ${leagueError.message}`)
      return null
    }
    if (!league) return null

    let standings: TeamStanding[] = []

    // Check if this is Avdeling B and calculate dynamic standings
    if (league.name === "Avdeling B") {
      standings = await calculateDynamicStandings(league.id)
    } else {
      // Use static standings from database for other leagues
      const { data: standingsData, error: standingsError } = await supabase
        .from("standings")
        .select(`
          id,
          position,
          played,
          won,
          drawn,
          lost,
          goals_for,
          goals_against,
          goal_difference,
          points,
          qualification_group,
          team_id,
          teams:team_id(id, name, logo_url)
        `)
        .eq("league_id", league.id)
        .order("position")

      if (standingsError) {
        console.error(`Error fetching standings: ${standingsError.message}`)
        return null
      }

      standings = standingsData.map((s) => ({
        position: s.position,
        teamId: s.team_id,
        teamName: s.teams.name,
        teamLogo: s.team_id === OUR_TEAM_ID ? OUR_TEAM_LOGO : s.teams.logo_url,
        played: s.played,
        won: s.won,
        drawn: s.drawn,
        lost: s.lost,
        goalsFor: s.goals_for,
        goalsAgainst: s.goals_against,
        goalDifference: s.goal_difference,
        points: s.points,
        qualificationGroup: s.qualification_group,
      }))
    }

    const { data: matchesData, error: matchesError } = await supabase
      .from("matches")
      .select(`
        id,
        week,
        match_date,
        match_time,
        home_score,
        away_score,
        location,
        played,
        home_team_id,
        away_team_id,
        home_team:home_team_id(id, name, logo_url),
        away_team:away_team_id(id, name, logo_url)
      `)
      .eq("league_id", league.id)
      .order("week")
      .order("match_date")
      .order("match_time")

    if (matchesError) {
      console.error(`Error fetching matches: ${matchesError.message}`)
      return null
    }

    const matches: MatchData[] = matchesData.map((m) => ({
      id: m.id,
      week: m.week,
      date: m.match_date,
      time: m.match_time,
      homeTeam: m.home_team.name,
      homeTeamId: m.home_team_id,
      homeTeamLogo: m.home_team.logo_url,
      awayTeam: m.away_team.name,
      awayTeamId: m.away_team_id,
      awayTeamLogo: m.away_team.logo_url,
      homeScore: m.home_score,
      awayScore: m.away_score,
      location: m.location,
      played: m.played,
    }))

    return {
      id: league.id,
      name: league.name,
      season: league.season,
      type: league.type,
      standings,
      matches,
      lastUpdated: new Date().toISOString(),
    }
  } catch (error) {
    console.error(`Error in getLeagueByName for ${leagueName}:`, error)
    return null
  }
}

// -----------------------
// Get upcoming matches
// -----------------------
export async function getUpcomingMatches(leagueId?: number, limit?: number, teamId?: number) {
  try {
    const todayStr = new Date().toISOString().split("T")[0]

    let query = supabase
      .from("matches")
      .select(`
        id,
        week,
        match_date,
        match_time,
        home_score,
        away_score,
        location,
        played,
        home_team:home_team_id(id, name, logo_url),
        away_team:away_team_id(id, name, logo_url),
        league:league_id(id, name, season)
      `)
      .eq("played", false)
      .gte("match_date", todayStr)
      .order("match_date", { ascending: true })
      .order("match_time", { ascending: true })

    if (leagueId) query = query.eq("league_id", leagueId)
    if (teamId) query = query.or(`home_team_id.eq.${teamId},away_team_id.eq.${teamId}`)
    if (limit) query = query.limit(limit * 2)

    const { data, error } = await query
    if (error) {
      console.error(`Error fetching upcoming matches: ${error.message}`)
      return []
    }

    const now = new Date()

    const formattedAndFiltered = data
      .map((match) => {
        const matchTime = match.match_time || "00:00:00"
        const fullDateString = `${match.match_date}T${matchTime}`

        return {
          id: match.id,
          week: match.week,
          date: fullDateString.split("T")[0],
          time: match.match_time,
          homeTeam: match.home_team.name,
          homeTeamId: match.home_team.id,
          homeTeamLogo: match.home_team.logo_url,
          awayTeam: match.away_team.name,
          awayTeamId: match.away_team.id,
          awayTeamLogo: match.away_team.logo_url,
          homeScore: match.home_score,
          awayScore: match.away_score,
          location: match.location,
          played: match.played,
          league: {
            id: match.league.id,
            name: match.league.name,
            season: match.league.season,
          },
        }
      })
      .filter((m) => new Date(`${m.date}T${m.time}`) > now)
      .slice(0, limit)

    return formattedAndFiltered
  } catch (error) {
    console.error("Error in getUpcomingMatches:", error)
    return []
  }
}

// -----------------------
// Get recent results
// -----------------------
export async function getRecentResults(leagueId?: number, limit?: number) {
  try {
    let query = supabase
      .from("matches")
      .select(`
        id,
        week,
        match_date,
        match_time,
        home_score,
        away_score,
        location,
        played,
        home_team:home_team_id(id, name, logo_url),
        away_team:away_team_id(id, name, logo_url),
        league:league_id(id, name, season)
      `)
      .eq("played", true)
      .order("match_date", { ascending: false })
      .order("match_time", { ascending: false })

    if (leagueId) query = query.eq("league_id", leagueId)
    if (limit) query = query.limit(limit)

    const { data, error } = await query
    if (error) {
      console.error(`Error fetching recent results: ${error.message}`)
      return []
    }

    return data.map((m) => ({
      id: m.id,
      week: m.week,
      date: m.match_date,
      time: m.match_time,
      homeTeam: m.home_team.name,
      homeTeamId: m.home_team.id,
      homeTeamLogo: m.home_team.logo_url,
      awayTeam: m.away_team.name,
      awayTeamId: m.away_team_id,
      awayTeamLogo: m.away_team.logo_url,
      homeScore: m.home_score,
      awayScore: m.away_score,
      location: m.location,
      played: m.played,
      league: {
        id: m.league.id,
        name: m.league.name,
        season: m.league.season,
      },
    }))
  } catch (error) {
    console.error("Error in getRecentResults:", error)
    return []
  }
}

// -----------------------
// Get league by ID
// -----------------------
export async function getLeagueById(leagueId: number) {
  try {
    const { data: league, error: leagueError } = await supabase.from("leagues").select("*").eq("id", leagueId).single()

    if (leagueError) {
      console.error(`Error fetching league: ${leagueError.message}`)
      return null
    }
    if (!league) return null

    let standings: TeamStanding[] = []

    // Check if this is Avdeling B and calculate dynamic standings
    if (league.name === "Avdeling B") {
      standings = await calculateDynamicStandings(league.id)
    } else {
      // Use static standings from database for other leagues
      const { data: standingsData, error: standingsError } = await supabase
        .from("standings")
        .select(`
          id,
          position,
          played,
          won,
          drawn,
          lost,
          goals_for,
          goals_against,
          goal_difference,
          points,
          qualification_group,
          team_id,
          teams:team_id(id, name, logo_url)
        `)
        .eq("league_id", league.id)
        .order("position")

      if (standingsError) {
        console.error(`Error fetching standings: ${standingsError.message}`)
        return null
      }

      standings = standingsData.map((s) => ({
        position: s.position,
        teamId: s.team_id,
        teamName: s.teams.name,
        teamLogo: s.team_id === OUR_TEAM_ID ? OUR_TEAM_LOGO : s.teams.logo_url,
        played: s.played,
        won: s.won,
        drawn: s.drawn,
        lost: s.lost,
        goalsFor: s.goals_for,
        goalsAgainst: s.goals_against,
        goalDifference: s.goal_difference,
        points: s.points,
        qualificationGroup: s.qualification_group,
      }))
    }

    const { data: matchesData, error: matchesError } = await supabase
      .from("matches")
      .select(`
        id,
        week,
        match_date,
        match_time,
        home_score,
        away_score,
        location,
        played,
        home_team_id,
        away_team_id,
        home_team:home_team_id(id, name, logo_url),
        away_team:away_team_id(id, name, logo_url)
      `)
      .eq("league_id", league.id)
      .order("week")
      .order("match_date")
      .order("match_time")

    if (matchesError) {
      console.error(`Error fetching matches: ${matchesError.message}`)
      return null
    }

    const matches: MatchData[] = matchesData.map((m) => ({
      id: m.id,
      week: m.week,
      date: m.match_date,
      time: m.match_time,
      homeTeam: m.home_team.name,
      homeTeamId: m.home_team_id,
      homeTeamLogo: m.home_team.logo_url,
      awayTeam: m.away_team.name,
      awayTeamId: m.away_team_id,
      awayTeamLogo: m.away_team.logo_url,
      homeScore: m.home_score,
      awayScore: m.away_score,
      location: m.location,
      played: m.played,
    }))

    return {
      id: league.id,
      name: league.name,
      season: league.season,
      type: league.type,
      standings,
      matches,
      lastUpdated: new Date().toISOString(),
    }
  } catch (error) {
    console.error(`Error in getLeagueById for ${leagueId}:`, error)
    return null
  }
}
