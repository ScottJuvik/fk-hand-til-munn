import type { MetadataRoute } from "next"
import { SITE_URL } from "@/lib/site"

// Served as /robots.txt. The admin, login and API aren't for search results.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/login", "/api/"] },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  }
}
