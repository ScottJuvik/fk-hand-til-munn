import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

// Writes go through the service-role client, not the browser's anon client:
// the anon role hits "infinite recursion detected in policy for relation
// 'users'" on writes (a pre-existing RLS policy bug), which the service
// role bypasses.
export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    const data = await request.json()

    const { title, excerpt, content, image, author, published_at, status } = data

    if (!title || !excerpt || !content) {
      return NextResponse.json({ error: "Title, excerpt, and content are required" }, { status: 400 })
    }

    const { data: article, error } = await supabase
      .from("news_articles")
      .insert({ title, excerpt, content, image, author, published_at, status: status || "published", is_featured: true })
      .select()
      .single()

    if (error || !article) {
      return NextResponse.json({ error: error?.message || "Failed to create article" }, { status: 500 })
    }

    // Every new article becomes the featured one.
    await supabase.from("news_articles").update({ is_featured: false }).neq("id", article.id)

    return NextResponse.json({ success: true, id: article.id })
  } catch (error) {
    console.error("Error creating article:", error)
    return NextResponse.json({ error: "Failed to create article" }, { status: 500 })
  }
}
