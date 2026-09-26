"use server"

import { createServerSupabaseClient } from "@/lib/supabase"

export type TeamStats = {
  matchesPlayed: number
  wins: number
  draws: number
  losses: number
  goalsScored: number
  goalsConceded: number
  cleanSheets: number
  goalDifference: number
}

export type TopScorer = {
  id: number
  name: string
  nickname: string | null
  position: string
  goals: number
  assists: number
  matches_played: number
  yellow_cards: number
  red_cards: number
  image_id: number | null      // ✅ added
  image_url: string | null
}

export async function getTeamStatistics(): Promise<{
  teamStats: TeamStats
  topScorers: TopScorer[]
}> {
  const supabase = createServerSupabaseClient()

  // Get team statistics for the current season. player_statistics carries a
  // row per player per league/season, and league 4 is the current one
  // (same convention used elsewhere, e.g. getLeagueById(4) on the homepage) —
  // without this filter, players with rows in older seasons show up twice.
  const { data: playerStats, error: statsError } = await supabase
    .from("player_statistics")
    .select("*")
    .eq("league", 4)

  if (statsError) {
    console.error("Error fetching player statistics:", statsError)
    throw new Error("Failed to fetch team statistics")
  }

  const totalGoals = playerStats.reduce((sum, player) => sum + (player.goals || 0), 0)

  const teamStats: TeamStats = {
    matchesPlayed: 12,
    wins: 8,
    draws: 3,
    losses: 1,
    goalsScored: totalGoals,
    goalsConceded: 10,
    cleanSheets: 5,
    goalDifference: totalGoals - 10,
  }

  // ✅ Fetch image_id as well
  const { data: topScorers, error: scorersError } = await supabase
    .from("player_statistics")
    .select(`
      player_id,
      goals,
      assists,
      matches_played,
      yellow_cards,
      red_cards,
      players:player_id (
        id,
        name,
        nickname,
        position,
        player_images:player_images_player_id_fkey(
            image_id,
            fifa_card_url,
            playercard_url
        )
      )
    `)
    .eq("league", 4)
    .order("goals", { ascending: false })
    .order("assists", { ascending: false })
    .order("yellow_cards", { ascending: true })
    .order("red_cards", { ascending: true })
    .order("players(name)", { ascending: true })
    .limit(10)

  if (scorersError) {
    console.error("Error fetching top scorers:", scorersError)
    throw new Error("Failed to fetch top scorers")
  }

  const formattedTopScorers: TopScorer[] = topScorers.map((scorer) => {
    const img = scorer.players.player_images

    return {
      id: scorer.players.id,
      name: scorer.players.name,
      nickname: scorer.players.nickname,
      position: scorer.players.position,
      goals: scorer.goals,
      assists: scorer.assists,
      matches_played: scorer.matches_played,
      yellow_cards: scorer.yellow_cards,
      red_cards: scorer.red_cards,
      image_id: img?.image_id || null,                          // ✅ return image_id
      image_url: img?.playercard_url || img?.fifa_card_url || null, // ✅ prefer playercard_url, fallback to fifa_card_url
    }
  })

  return {
    teamStats,
    topScorers: formattedTopScorers,
  }
}
