export interface NewsArticle {
  id: string
  title: string
  excerpt: string
  content: string
  date: string
  /** Raw published_at from the database (none for the legacy articles). */
  publishedAt?: string | null
  /** When the article was added to the site (none for the legacy articles). */
  createdAt?: string | null
  image: string
  author: string
  isFeatured?: boolean
}
