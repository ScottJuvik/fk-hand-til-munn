export interface NewsArticle {
  id: string
  title: string
  excerpt: string
  content: string
  date: string
  /** Raw published_at from the database (none for the legacy articles). */
  publishedAt?: string | null
  image: string
  author: string
  isFeatured?: boolean
}
