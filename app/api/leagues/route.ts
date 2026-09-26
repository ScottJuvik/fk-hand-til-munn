import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    const data = await request.json()

    const { name, season, type, year } = data

    if (!name || !season || !type || !year) {
      return NextResponse.json({ error: "Name, season, type, and year are required" }, { status: 400 })
    }

    const { data: league, error } = await supabase
      .from("leagues")
      .insert({ name, season, type, year })
      .select()
      .single()

    if (error || !league) {
      return NextResponse.json({ error: error?.message || "Failed to create league" }, { status: 500 })
    }

    return NextResponse.json({ success: true, id: league.id })
  } catch (error) {
    console.error("Error creating league:", error)
    return NextResponse.json({ error: "Failed to create league" }, { status: 500 })
  }
}
