import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"
import { editConflictResponse } from "@/lib/edit-conflict"

// Uses the service-role client for the same reason as POST /api/lineups:
// the anon role hits "infinite recursion detected in policy for relation
// 'users'" on lineups/lineup_players writes.
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createServerSupabaseClient()
    const lineupId = Number.parseInt(params.id)

    if (isNaN(lineupId)) {
      return NextResponse.json({ error: "Invalid lineup ID" }, { status: 400 })
    }

    const data = await request.json()
    const { name, formation, match_date, location, match_id, is_active, starters, substitutes } = data
    // The lineup's `updated_at` when the edit page loaded.
    const version: string | undefined = data.version

    if (!Array.isArray(starters) || starters.length === 0) {
      return NextResponse.json({ error: "A full starting XI is required" }, { status: 400 })
    }

    // The lineup goes first: if someone else changed it since the page
    // loaded, nothing is saved, the match included. Setting updated_at bumps
    // the version even when only the players (lineup_players) change.
    let lineupUpdate = supabase
      .from("lineups")
      .update({ name, formation, match_date, is_active, updated_at: new Date().toISOString() })
      .eq("id", lineupId)
    if (version) lineupUpdate = lineupUpdate.eq("updated_at", version)
    const { data: updatedLineups, error: lineupError } = await lineupUpdate.select("id")

    if (lineupError) {
      return NextResponse.json({ error: lineupError.message }, { status: 500 })
    }
    if (version && updatedLineups.length === 0) return editConflictResponse()

    if (match_id && (match_date || location)) {
      const matchUpdate: Record<string, string> = {}
      if (match_date) matchUpdate.match_date = match_date
      if (location) matchUpdate.location = location

      const { error: matchError } = await supabase.from("matches").update(matchUpdate).eq("id", match_id)
      if (matchError) {
        return NextResponse.json({ error: matchError.message }, { status: 500 })
      }
    }

    if (is_active) {
      await supabase.from("lineups").update({ is_active: false }).neq("id", lineupId)
    }

    const { error: deleteError } = await supabase.from("lineup_players").delete().eq("lineup_id", lineupId)

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 })
    }

    const lineupPlayers = [
      ...starters.map((s: { player_id: number; position: string; position_order: number }) => ({
        lineup_id: lineupId,
        player_id: s.player_id,
        position: s.position,
        position_order: s.position_order,
        is_substitute: false,
      })),
      ...(substitutes || []).map((s: { player_id: number; position: string; position_order: number }) => ({
        lineup_id: lineupId,
        player_id: s.player_id,
        position: s.position,
        position_order: s.position_order,
        is_substitute: true,
      })),
    ]

    const { error: playersError } = await supabase.from("lineup_players").insert(lineupPlayers)

    if (playersError) {
      return NextResponse.json({ error: playersError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating lineup:", error)
    return NextResponse.json({ error: "Failed to update lineup" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createServerSupabaseClient()
    const lineupId = Number.parseInt(params.id)

    if (isNaN(lineupId)) {
      return NextResponse.json({ error: "Invalid lineup ID" }, { status: 400 })
    }

    const { error: playersError } = await supabase.from("lineup_players").delete().eq("lineup_id", lineupId)

    if (playersError) {
      return NextResponse.json({ error: playersError.message }, { status: 500 })
    }

    const { error: lineupError } = await supabase.from("lineups").delete().eq("id", lineupId)

    if (lineupError) {
      return NextResponse.json({ error: lineupError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting lineup:", error)
    return NextResponse.json({ error: "Failed to delete lineup" }, { status: 500 })
  }
}
