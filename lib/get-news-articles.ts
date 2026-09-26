"use server"

// Runs on the server (also when called from client components), so drafts
// are filtered out before anything reaches the browser.
import { createServerSupabaseClient } from "@/lib/supabase"
import type { NewsArticleRow } from "@/types/supabase"
import type { NewsArticle } from "@/data/news"
import { legacyNewsArticles } from "@/data/legacy-news"

function formatDate(published_at: string | null): string {
  if (!published_at) return ""
  return new Date(published_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

function mapRow(row: NewsArticleRow): NewsArticle {
  return {
    id: String(row.id),
    title: row.title,
    excerpt: row.excerpt,
    content: row.content,
    date: formatDate(row.published_at),
    image: row.image || "/placeholder.svg",
    author: row.author || "FK Hånd til Munn",
    isFeatured: row.is_featured,
  }
}

function withFeaturedFirst(articles: NewsArticle[]): NewsArticle[] {
  const featuredIndex = articles.findIndex((article) => article.isFeatured)
  if (featuredIndex <= 0) return articles

  const featured = articles[featuredIndex]
  return [featured, ...articles.slice(0, featuredIndex), ...articles.slice(featuredIndex + 1)]
}

// True once we know the "status" column exists, so we don't retry the
// no-filter fallback query on every single call after the first success.
let statusColumnExists: boolean | null = null

export async function fetchNewsArticles(): Promise<NewsArticle[]> {
  const supabase = createServerSupabaseClient()
  let query = supabase.from("news_articles").select("*").order("published_at", { ascending: false })
  if (statusColumnExists !== false) {
    query = query.eq("status", "published")
  }

  let { data, error } = await query

  // The status column may not exist yet if the news status column migration hasn't
  // been run — fall back to showing everything rather than erroring out.
  if (error?.code === "42703") {
    statusColumnExists = false
    ;({ data, error } = await supabase
      .from("news_articles")
      .select("*")
      .order("published_at", { ascending: false }))
  } else if (!error) {
    statusColumnExists = true
  }

  // Falls back to the original hardcoded articles when the news_articles
  // table hasn't been created/seeded in Supabase yet.
  if (error || !data || data.length === 0) {
    if (error) console.error("Error fetching news articles:", error)
    return withFeaturedFirst(legacyNewsArticles)
  }

  return withFeaturedFirst(data.map(mapRow))
}

export async function fetchNewsArticleById(id: string): Promise<NewsArticle | null> {
  const supabase = createServerSupabaseClient()
  const numericId = Number.parseInt(id)
  if (!isNaN(numericId)) {
    const { data, error } = await supabase.from("news_articles").select("*").eq("id", numericId).single()
    // Drafts are only visible in the admin editor. Rows without a status
    // (column not migrated yet) count as published, as in fetchNewsArticles.
    const status = (data as { status?: string | null } | null)?.status
    if (!error && data && (status == null || status === "published")) {
      return mapRow(data)
    }
  }

  return legacyNewsArticles.find((article) => article.id === id) || null
}
