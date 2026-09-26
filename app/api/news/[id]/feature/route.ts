import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

// Uses the service-role client for the same reason as the other /api/news
// routes: the anon role hits "infinite recursion detected in policy for
// relation 'users'" on writes.
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createServerSupabaseClient()
    const articleId = Number.parseInt(params.id)

    if (isNaN(articleId)) {
      return NextResponse.json({ error: "Invalid article ID" }, { status: 400 })
    }

    const { error: clearError } = await supabase
      .from("news_articles")
      .update({ is_featured: false })
      .neq("id", articleId)

    if (clearError) {
      return NextResponse.json({ error: clearError.message }, { status: 500 })
    }

    const { error: setError } = await supabase
      .from("news_articles")
      .update({ is_featured: true })
      .eq("id", articleId)

    if (setError) {
      return NextResponse.json({ error: setError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error setting featured article:", error)
    return NextResponse.json({ error: "Failed to set featured article" }, { status: 500 })
  }
}
