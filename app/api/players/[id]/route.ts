import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"
import { editConflictResponse } from "@/lib/edit-conflict"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createServerSupabaseClient()
    const playerId = Number.parseInt(params.id)

    if (isNaN(playerId)) {
      return NextResponse.json({ error: "Invalid player ID" }, { status: 400 })
    }

    const data = await request.json()
    // The `updated_at` of the player and of their stats when the edit page loaded.
    const version: { player: string; stats: string | null } | undefined = data.version

    if (version) {
      const { data: currentStats } = await supabase
        .from("player_stats")
        .select("updated_at")
        .eq("player_id", playerId)
        .maybeSingle()
      if ((currentStats?.updated_at ?? null) !== version.stats) return editConflictResponse()
    }

    // Update player data. Note: player photos live in the separate
    // `player_images` table (linked via players.image_id), not an
    // `image_url` column on `players` — sending that field here 500s
    // with "Could not find the 'image_url' column".
    let playerUpdate = supabase
      .from("players")
      .update({
        name: data.name,
        position: data.position,
        rating: data.rating,
        nationality: data.nationality,
        club: data.club,
        shirt_number: data.shirt_number,
        weak_foot: data.weak_foot,
        skill_moves: data.skill_moves,
        attacking_work_rate: data.attacking_work_rate,
        defensive_work_rate: data.defensive_work_rate,
        nickname: data.nickname,
        alternate_positions: data.alternate_positions,
        specialties: data.specialties,
        is_icon: data.is_icon,
      })
      .eq("id", playerId)
    // Only saves if nobody changed the player since the page loaded.
    if (version) playerUpdate = playerUpdate.eq("updated_at", version.player)
    const { data: updatedPlayers, error: playerError } = await playerUpdate.select("id")

    if (playerError) {
      return NextResponse.json({ error: playerError.message }, { status: 500 })
    }
    if (version && updatedPlayers.length === 0) return editConflictResponse()

    // Update player stats if provided. New players don't have a player_stats
    // row yet, so insert one the first time rather than silently no-op'ing
    // an UPDATE that matches zero rows.
    if (data.stats) {
      const statsPayload = {
        pace: data.stats.pace,
        shooting: data.stats.shooting,
        passing: data.stats.passing,
        dribbling: data.stats.dribbling,
        defending: data.stats.defending,
        physical: data.stats.physical,
        acceleration: data.stats.acceleration,
        sprint_speed: data.stats.sprint_speed,
        positioning: data.stats.positioning,
        finishing: data.stats.finishing,
        shot_power: data.stats.shot_power,
        long_shots: data.stats.long_shots,
        vision: data.stats.vision,
        crossing: data.stats.crossing,
        free_kick: data.stats.free_kick,
        short_passing: data.stats.short_passing,
        long_passing: data.stats.long_passing,
        curve: data.stats.curve,
        agility: data.stats.agility,
        balance: data.stats.balance,
        reactions: data.stats.reactions,
        ball_control: data.stats.ball_control,
        composure: data.stats.composure,
        interceptions: data.stats.interceptions,
        heading_accuracy: data.stats.heading_accuracy,
        marking: data.stats.marking,
        standing_tackle: data.stats.standing_tackle,
        sliding_tackle: data.stats.sliding_tackle,
        jumping: data.stats.jumping,
        stamina: data.stats.stamina,
        strength: data.stats.strength,
        aggression: data.stats.aggression,
      }

      const { data: existingStats } = await supabase
        .from("player_stats")
        .select("id")
        .eq("player_id", playerId)
        .maybeSingle()

      const { error: statsError } = existingStats
        ? await supabase.from("player_stats").update(statsPayload).eq("player_id", playerId)
        : await supabase.from("player_stats").insert({ player_id: playerId, ...statsPayload })

      if (statsError) {
        return NextResponse.json({ error: statsError.message }, { status: 500 })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating player:", error)
    return NextResponse.json({ error: "Failed to update player" }, { status: 500 })
  }
}

// Deleting a player also removes their stats, images, season stats, lineup
// slots and band entry via ON DELETE CASCADE foreign keys.
export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  const playerId = Number.parseInt(params.id)
  if (isNaN(playerId)) {
    return NextResponse.json({ error: "Invalid player ID" }, { status: 400 })
  }

  const supabase = createServerSupabaseClient()
  const { error } = await supabase.from("players").delete().eq("id", playerId)
  if (error) {
    console.error("Error deleting player:", error)
    return NextResponse.json({ error: `Error deleting player: ${error.message}` }, { status: 500 })
  }
  return NextResponse.json({ success: true })
}
