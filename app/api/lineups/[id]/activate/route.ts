import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

// Uses the service-role client for the same reason as the other /api/lineups
// routes: the anon role hits "infinite recursion detected in policy for
// relation 'users'" on writes.
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createServerSupabaseClient()
    const lineupId = Number.parseInt(params.id)

    if (isNaN(lineupId)) {
      return NextResponse.json({ error: "Invalid lineup ID" }, { status: 400 })
    }

    const { error: clearError } = await supabase.from("lineups").update({ is_active: false }).neq("id", lineupId)

    if (clearError) {
      return NextResponse.json({ error: clearError.message }, { status: 500 })
    }

    const { error: setError } = await supabase.from("lineups").update({ is_active: true }).eq("id", lineupId)

    if (setError) {
      return NextResponse.json({ error: setError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error setting active lineup:", error)
    return NextResponse.json({ error: "Failed to set active lineup" }, { status: 500 })
  }
}
