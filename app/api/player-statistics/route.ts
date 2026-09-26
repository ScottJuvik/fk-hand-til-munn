import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

// Uses the service-role client for the same reason as the other admin
// mutation routes: the anon role hits "infinite recursion detected in
// policy for relation 'users'" on writes.
//
// player_statistics has no primary key column exposed via the API (just a
// player_id + league composite), so there's nothing to PUT by id — every
// save here upserts by (player_id, league) instead.
export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    const data = await request.json()

    const { player_id, league, matches_played, goals, assists, yellow_cards, red_cards, minutes_played } = data

    if (!player_id || !league) {
      return NextResponse.json({ error: "player_id and league are required" }, { status: 400 })
    }

    const statsPayload = {
      matches_played: matches_played || 0,
      goals: goals || 0,
      assists: assists || 0,
      yellow_cards: yellow_cards || 0,
      red_cards: red_cards || 0,
      minutes_played: minutes_played || 0,
      updated_at: new Date().toISOString(),
    }

    const { data: existing } = await supabase
      .from("player_statistics")
      .select("player_id")
      .eq("player_id", player_id)
      .eq("league", league)
      .maybeSingle()

    const { error } = existing
      ? await supabase
          .from("player_statistics")
          .update(statsPayload)
          .eq("player_id", player_id)
          .eq("league", league)
      : await supabase.from("player_statistics").insert({ player_id, league, ...statsPayload })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error saving player statistics:", error)
    return NextResponse.json({ error: "Failed to save player statistics" }, { status: 500 })
  }
}
