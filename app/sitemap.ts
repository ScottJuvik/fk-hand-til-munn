import type { MetadataRoute } from "next"
import { fetchNewsArticles } from "@/lib/get-news-articles"
import { SITE_URL } from "@/lib/site"

// Served as /sitemap.xml: the public pages and every published news article.
// Rebuilt at most once an hour, so new articles show up without a deploy.
export const revalidate = 3600

const PAGES = ["", "/players", "/statistics", "/lineup", "/news", "/band", "/about"]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const articles = await fetchNewsArticles().catch(() => [])
  return [
    ...PAGES.map((path) => ({ url: `${SITE_URL}${path}` })),
    ...articles.map((article) => ({
      url: `${SITE_URL}/news/${article.id}`,
      ...(article.publishedAt ? { lastModified: new Date(article.publishedAt) } : {}),
    })),
  ]
}
