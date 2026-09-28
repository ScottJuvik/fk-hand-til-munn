import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"
import { editConflictResponse } from "@/lib/edit-conflict"

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
    // The article's `updated_at` when the edit page loaded.
    const version: string | undefined = data.version

    if (!title || !excerpt || !content) {
      return NextResponse.json({ error: "Title, excerpt, and content are required" }, { status: 400 })
    }

    // updated_at is set by a database trigger.
    let update = supabase
      .from("news_articles")
      .update({
        title,
        excerpt,
        content,
        image,
        author,
        published_at,
        status: status || "published",
      })
      .eq("id", articleId)
    // Only saves if nobody changed the article since the page loaded.
    if (version) update = update.eq("updated_at", version)
    const { data: updated, error } = await update.select("id")

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    if (version && updated.length === 0) return editConflictResponse()

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
