"use server"

import { createServerSupabaseClient } from "@/lib/supabase"
import type { TopScorer } from "./get-team-statistics"

export async function getTopScorersByLeague(leagueId: number): Promise<TopScorer[]> {
  const supabase = createServerSupabaseClient()

  try {
    const { data, error } = await supabase
      .from("player_statistics")
      .select(`
        goals,
        assists,
        matches_played,
        yellow_cards,
        red_cards,
        player:players (
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
      .eq("league", leagueId)
      .order("goals", { ascending: false })
      // Tied on goals: more assists ranks higher
      .order("assists", { ascending: false })
      .limit(5)

    if (error) {
      console.error("Error fetching top scorers:", error)
      return []
    }

    if (!data || data.length === 0) {
      return []
    }

    const topScorers: TopScorer[] = data.map((stat: any) => {
      const player = stat.player
      const image = player?.player_images?.[0]

      return {
        id: player?.id || stat.player_id,
        name: player?.name || "Unknown Player",
        nickname: player?.nickname || null,
        position: player?.position || "Unknown",
        goals: stat.goals || 0,
        assists: stat.assists || 0,
        matches_played: stat.matches_played || 0,
        yellow_cards: stat.yellow_cards || 0,
        red_cards: stat.red_cards || 0,
        image_id: image?.image_id || null,
        image_url: image?.playercard_url || null,
      }
    })

    return topScorers
  } catch (error) {
    console.error("Error in getTopScorersByLeague:", error)
    return []
  }
}
