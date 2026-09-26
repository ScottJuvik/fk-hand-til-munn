import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

const DEFAULT_STAT = 50

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    const data = await request.json()

    if (!data.name || !data.position || !data.rating) {
      return NextResponse.json({ error: "Name, position, and rating are required" }, { status: 400 })
    }

    const { data: player, error: playerError } = await supabase
      .from("players")
      .insert({
        name: data.name,
        position: data.position,
        rating: data.rating,
        nationality: data.nationality || null,
        club: data.club || "FK Hånd til Munn",
        shirt_number: data.shirt_number ?? null,
        weak_foot: data.weak_foot || null,
        skill_moves: data.skill_moves || null,
        attacking_work_rate: data.attacking_work_rate || null,
        defensive_work_rate: data.defensive_work_rate || null,
        nickname: data.nickname || null,
        alternate_positions: data.alternate_positions || null,
        specialties: data.specialties || null,
        is_icon: data.is_icon || false,
      })
      .select()
      .single()

    if (playerError || !player) {
      return NextResponse.json({ error: playerError?.message || "Failed to create player" }, { status: 500 })
    }

    const stats = data.stats || {}
    const statField = (key: string) => (typeof stats[key] === "number" ? stats[key] : DEFAULT_STAT)

    const { error: statsError } = await supabase.from("player_stats").insert({
      player_id: player.id,
      pace: statField("pace"),
      shooting: statField("shooting"),
      passing: statField("passing"),
      dribbling: statField("dribbling"),
      defending: statField("defending"),
      physical: statField("physical"),
      acceleration: statField("acceleration"),
      sprint_speed: statField("sprint_speed"),
      positioning: statField("positioning"),
      finishing: statField("finishing"),
      shot_power: statField("shot_power"),
      long_shots: statField("long_shots"),
      vision: statField("vision"),
      crossing: statField("crossing"),
      free_kick: statField("free_kick"),
      short_passing: statField("short_passing"),
      long_passing: statField("long_passing"),
      curve: statField("curve"),
      agility: statField("agility"),
      balance: statField("balance"),
      reactions: statField("reactions"),
      ball_control: statField("ball_control"),
      composure: statField("composure"),
      interceptions: statField("interceptions"),
      heading_accuracy: statField("heading_accuracy"),
      marking: statField("marking"),
      standing_tackle: statField("standing_tackle"),
      sliding_tackle: statField("sliding_tackle"),
      jumping: statField("jumping"),
      stamina: statField("stamina"),
      strength: statField("strength"),
      aggression: statField("aggression"),
    })

    if (statsError) {
      // Roll back the player row so a failed save doesn't leave a statless player behind.
      await supabase.from("players").delete().eq("id", player.id)
      return NextResponse.json({ error: statsError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, id: player.id })
  } catch (error) {
    console.error("Error creating player:", error)
    return NextResponse.json({ error: "Failed to create player" }, { status: 500 })
  }
}
