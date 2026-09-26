import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    const data = await request.json()

    const { league_id, week, match_date, match_time, home_team_id, away_team_id, location } = data

    if (!league_id || !match_date || !match_time || !home_team_id || !away_team_id || !location) {
      return NextResponse.json({ error: "League, date, time, teams, and location are required" }, { status: 400 })
    }

    if (home_team_id === away_team_id) {
      return NextResponse.json({ error: "Home and away team must be different" }, { status: 400 })
    }

    const { data: match, error } = await supabase
      .from("matches")
      .insert({
        league_id,
        week: week || 1,
        match_date,
        match_time,
        home_team_id,
        away_team_id,
        location,
        played: false,
      })
      .select()
      .single()

    if (error || !match) {
      return NextResponse.json({ error: error?.message || "Failed to create fixture" }, { status: 500 })
    }

    return NextResponse.json({ success: true, id: match.id })
  } catch (error) {
    console.error("Error creating fixture:", error)
    return NextResponse.json({ error: "Failed to create fixture" }, { status: 500 })
  }
}
