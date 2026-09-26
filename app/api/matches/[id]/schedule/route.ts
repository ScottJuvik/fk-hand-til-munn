import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

// Separate from PUT /api/matches/[id] (which handles recording a result and
// recalculating standings) so editing the date/time/venue can never touch
// scores or trigger a standings recalculation.
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createServerSupabaseClient()
    const matchId = Number.parseInt(params.id)

    if (isNaN(matchId)) {
      return NextResponse.json({ error: "Invalid match ID" }, { status: 400 })
    }

    const { match_date, match_time, location } = await request.json()

    if (!match_date || !match_time || !location) {
      return NextResponse.json({ error: "Date, time, and location are required" }, { status: 400 })
    }

    const { error } = await supabase
      .from("matches")
      .update({ match_date, match_time, location, updated_at: new Date().toISOString() })
      .eq("id", matchId)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating match schedule:", error)
    return NextResponse.json({ error: "Failed to update match schedule" }, { status: 500 })
  }
}
