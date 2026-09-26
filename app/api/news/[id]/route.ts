import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

// Uses the service-role client for the same reason as POST /api/news:
// the anon role hits "infinite recursion detected in policy for relation
// 'users'" on writes.
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createServerSupabaseClient()
    const articleId = Number.parseInt(params.id)

    if (isNaN(articleId)) {
      return NextResponse.json({ error: "Invalid article ID" }, { status: 400 })
    }

    const data = await request.json()
    const { title, excerpt, content, image, author, published_at, status } = data

    if (!title || !excerpt || !content) {
      return NextResponse.json({ error: "Title, excerpt, and content are required" }, { status: 400 })
    }

    const { error } = await supabase
      .from("news_articles")
      .update({
        title,
        excerpt,
        content,
        image,
        author,
        published_at,
        status: status || "published",
        updated_at: new Date().toISOString(),
      })
      .eq("id", articleId)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating article:", error)
    return NextResponse.json({ error: "Failed to update article" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createServerSupabaseClient()
    const articleId = Number.parseInt(params.id)

    if (isNaN(articleId)) {
      return NextResponse.json({ error: "Invalid article ID" }, { status: 400 })
    }

    const { error } = await supabase.from("news_articles").delete().eq("id", articleId)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // If that was the featured article, promote the most recently published
    // remaining one so there's always a featured article.
    const { data: stillFeatured } = await supabase.from("news_articles").select("id").eq("is_featured", true).limit(1)

    if (!stillFeatured || stillFeatured.length === 0) {
      const { data: nextFeatured } = await supabase
        .from("news_articles")
        .select("id")
        .order("published_at", { ascending: false })
        .limit(1)

      if (nextFeatured && nextFeatured.length > 0) {
        await supabase.from("news_articles").update({ is_featured: true }).eq("id", nextFeatured[0].id)
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting article:", error)
    return NextResponse.json({ error: "Failed to delete article" }, { status: 500 })
  }
}
