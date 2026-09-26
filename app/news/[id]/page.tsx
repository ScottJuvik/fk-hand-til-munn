import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChevronLeft, Calendar, User } from "lucide-react"
import { fetchNewsArticleById, fetchNewsArticles } from "@/lib/get-news-articles"

interface NewsPageProps {
  params: {
    id: string
  }
}

export const revalidate = 0

export async function generateMetadata({ params }: NewsPageProps): Promise<Metadata> {
  const article = await fetchNewsArticleById(params.id)

  if (!article) {
    return {
      title: "Article Not Found | FK Hånd til Munn",
    }
  }

  return {
    title: `${article.title} | FK Hånd til Munn`,
    description: article.excerpt,
  }
}

export default async function NewsArticlePage({ params }: NewsPageProps) {
  const article = await fetchNewsArticleById(params.id)

  if (!article) {
    notFound()
  }

  const allArticles = await fetchNewsArticles()

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <Button asChild variant="ghost" className="mb-4">
          <Link href="/news" className="flex items-center">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to News
          </Link>
        </Button>

        <h1 className="text-4xl font-bold mb-4">{article.title}</h1>

        <div className="flex flex-wrap items-center text-gray-500 mb-6 gap-4">
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-1" />
            <span>{article.date}</span>
          </div>
          <div className="flex items-center">
            <User className="h-4 w-4 mr-1" />
            <span>{article.author}</span>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <img
          src={article.image || "/placeholder.svg"}
          alt={article.title}
          className="w-full h-[400px] object-cover rounded-lg"
        />
      </div>

      <div
        className="max-w-[68ch] mx-auto text-[17px] leading-[1.85] text-gray-800
          [&>h2]:text-3xl [&>h2]:font-black [&>h2]:tracking-tight [&>h2]:mb-6 [&>h2]:mt-2 [&>h2]:text-black
          [&>p]:mb-6
          [&>p:first-of-type]:text-xl [&>p:first-of-type]:leading-relaxed [&>p:first-of-type]:font-medium [&>p:first-of-type]:text-gray-900
          [&_strong]:font-semibold [&_strong]:text-gray-900
          [&>blockquote]:my-8 [&>blockquote]:border-l-4 [&>blockquote]:border-black [&>blockquote]:bg-gray-50 [&>blockquote]:py-3 [&>blockquote]:pl-6 [&>blockquote]:pr-4 [&>blockquote]:italic [&>blockquote]:text-xl [&>blockquote]:leading-snug [&>blockquote]:text-gray-700"
        dangerouslySetInnerHTML={{ __html: article.content }}
      />

      <div className="mt-12 border-t pt-8">
        <h3 className="text-xl font-bold mb-4">More News</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {allArticles
            .filter((a) => a.id !== article.id)
            .slice(0, 2)
            .map((relatedArticle) => (
              <Link key={relatedArticle.id} href={`/news/${relatedArticle.id}`} className="block group">
                <div className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                  <div className="h-40 overflow-hidden">
                    <img
                      src={relatedArticle.image || "/placeholder.svg"}
                      alt={relatedArticle.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-4">
                    <h4 className="font-bold mb-1 group-hover:text-blue-600 transition-colors">
                      {relatedArticle.title}
                    </h4>
                    <p className="text-sm text-gray-500">{relatedArticle.date}</p>
                  </div>
                </div>
              </Link>
            ))}
        </div>
      </div>
    </div>
  )
}
