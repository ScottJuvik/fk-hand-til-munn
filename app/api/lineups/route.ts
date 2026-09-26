import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

// Writes go through the service-role client, not the browser's anon client:
// the anon role currently hits "infinite recursion detected in policy for
// relation 'users'" on lineups/lineup_players inserts (a pre-existing RLS
// policy bug), which the service role bypasses.
export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    const data = await request.json()

    const { name, formation, match_date, location, match_id, is_active, starters, substitutes } = data

    if (!match_id || !Array.isArray(starters) || starters.length === 0) {
      return NextResponse.json({ error: "A match and a full starting XI are required" }, { status: 400 })
    }

    // The date/pitch shown on the create form are editable overrides on the
    // underlying match itself (e.g. a postponed kickoff or a venue change),
    // not just the lineup's own copy of them.
    if (match_date || location) {
      const matchUpdate: Record<string, string> = {}
      if (match_date) matchUpdate.match_date = match_date
      if (location) matchUpdate.location = location

      const { error: matchError } = await supabase.from("matches").update(matchUpdate).eq("id", match_id)
      if (matchError) {
        return NextResponse.json({ error: matchError.message }, { status: 500 })
      }
    }

    const { data: lineup, error: lineupError } = await supabase
      .from("lineups")
      .insert({ name, formation, match_date, match_id, is_active })
      .select()
      .single()

    if (lineupError || !lineup) {
      return NextResponse.json({ error: lineupError?.message || "Failed to create lineup" }, { status: 500 })
    }

    // A newly created lineup becomes the active one by default.
    if (lineup.is_active) {
      await supabase.from("lineups").update({ is_active: false }).neq("id", lineup.id)
    }

    const lineupPlayers = [
      ...starters.map((s: { player_id: number; position: string; position_order: number }) => ({
        lineup_id: lineup.id,
        player_id: s.player_id,
        position: s.position,
        position_order: s.position_order,
        is_substitute: false,
      })),
      ...(substitutes || []).map((s: { player_id: number; position: string; position_order: number }) => ({
        lineup_id: lineup.id,
        player_id: s.player_id,
        position: s.position,
        position_order: s.position_order,
        is_substitute: true,
      })),
    ]

    const { error: playersError } = await supabase.from("lineup_players").insert(lineupPlayers)

    if (playersError) {
      // Roll back the lineup row so a failed save doesn't leave an empty lineup behind.
      await supabase.from("lineups").delete().eq("id", lineup.id)
      return NextResponse.json({ error: playersError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, id: lineup.id })
  } catch (error) {
    console.error("Error creating lineup:", error)
    return NextResponse.json({ error: "Failed to create lineup" }, { status: 500 })
  }
}
