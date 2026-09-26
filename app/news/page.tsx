import type { Metadata } from "next"
import Link from "next/link"
import { Calendar, User } from "lucide-react"
import { fetchNewsArticles } from "@/lib/get-news-articles"

export const metadata: Metadata = {
  title: "News | FK Hånd til Munn",
  description: "Latest news and updates from FK Hånd til Munn football club",
}

export const revalidate = 0

export default async function NewsPage() {
  const newsArticles = await fetchNewsArticles()

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-4xl font-bold mb-8">Latest News</h1>

      {newsArticles.length === 0 && <p className="text-gray-500">No news articles yet.</p>}

      {/* Featured article */}
      {newsArticles.length > 0 && (
        <div className="mb-12">
          <Link href={`/news/${newsArticles[0].id}`} className="block group">
            <div className="grid md:grid-cols-2 gap-6 bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
              <div className="h-64 md:h-auto overflow-hidden">
                <img
                  src={newsArticles[0].image || "/placeholder.svg"}
                  alt={newsArticles[0].title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-6 flex flex-col justify-center">
                <div className="flex flex-wrap items-center text-gray-500 mb-3 gap-4">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span className="text-sm">{newsArticles[0].date}</span>
                  </div>
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-1" />
                    <span className="text-sm">{newsArticles[0].author}</span>
                  </div>
                </div>
                <h2 className="text-2xl font-bold mb-3 group-hover:text-blue-600 transition-colors">
                  {newsArticles[0].title}
                </h2>
                <p className="text-gray-600 mb-4">{newsArticles[0].excerpt}</p>
                <span className="text-blue-600 font-medium group-hover:underline">Read more</span>
              </div>
            </div>
          </Link>
        </div>
      )}

      {/* All articles */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {newsArticles.slice(1).map((article) => (
          <Link key={article.id} href={`/news/${article.id}`} className="block group">
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow h-full flex flex-col">
              <div className="h-48 overflow-hidden">
                <img
                  src={article.image || "/placeholder.svg"}
                  alt={article.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-5 flex-grow flex flex-col">
                <div className="flex items-center text-gray-500 mb-2">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span className="text-sm">{article.date}</span>
                </div>
                <h3 className="text-xl font-bold mb-2 group-hover:text-blue-600 transition-colors">{article.title}</h3>
                <p className="text-gray-600 mb-4 flex-grow">{article.excerpt}</p>
                <span className="text-blue-600 font-medium group-hover:underline mt-auto">Read more</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
