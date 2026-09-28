"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { ArrowRight, X } from "lucide-react"
import type { NewsArticle } from "@/data/news"

// Card in the corner of the home page when a news article was published in
// the last 7 days. Each visitor sees it once per article: closing it or
// opening the article hides it until a newer one is published.

const NEW_FOR_DAYS = 7
const SEEN_KEY = "htm-news-notice-seen"
// Lets the page settle before the card slides in.
const SHOW_DELAY_MS = 1200

function daysAgo(publishedAt: string) {
  const days = Math.floor((Date.now() - new Date(publishedAt).getTime()) / 86_400_000)
  if (days <= 0) return "Today"
  if (days === 1) return "Yesterday"
  return `${days} days ago`
}

export function NewArticleNotice({ articles, enabled }: { articles: NewsArticle[]; enabled: boolean }) {
  const [visible, setVisible] = useState(false)

  // The newest published article, if it's recent enough.
  const article = useMemo(() => {
    const newest = articles
      .filter((a) => a.publishedAt && new Date(a.publishedAt).getTime() <= Date.now())
      .sort((a, b) => new Date(b.publishedAt!).getTime() - new Date(a.publishedAt!).getTime())[0]
    if (!newest) return null
    const age = Date.now() - new Date(newest.publishedAt!).getTime()
    return age <= NEW_FOR_DAYS * 86_400_000 ? newest : null
  }, [articles])

  useEffect(() => {
    if (!enabled || !article) return
    try {
      if (localStorage.getItem(SEEN_KEY) === article.id) return
    } catch {}
    const t = setTimeout(() => setVisible(true), SHOW_DELAY_MS)
    return () => clearTimeout(t)
  }, [enabled, article])

  if (!article) return null

  const markSeen = () => {
    setVisible(false)
    try {
      localStorage.setItem(SEEN_KEY, article.id)
    } catch {}
  }

  return (
    <aside
      aria-label="New article"
      aria-hidden={!visible}
      className={`fixed inset-x-4 bottom-4 z-40 transition-all duration-500 ease-out sm:inset-x-auto sm:right-6 sm:bottom-6 sm:w-[380px] motion-reduce:transition-none ${
        visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-6 opacity-0"
      }`}
    >
      <div className="relative flex gap-4 overflow-hidden rounded-2xl bg-white p-3 pr-10 shadow-2xl ring-1 ring-black/5">
        <div className="absolute inset-y-0 left-0 w-1 bg-[#D4AF37]" aria-hidden="true" />
        <img
          src={article.image}
          alt=""
          className="h-20 w-20 shrink-0 rounded-xl object-cover"
        />
        <div className="min-w-0 flex-1 py-0.5">
          <div className="mb-1 flex items-center gap-2 text-xs">
            <span className="rounded-full bg-[#D4AF37] px-2 py-0.5 font-bold uppercase tracking-wider text-black">
              New article
            </span>
            <span className="text-gray-500">{daysAgo(article.publishedAt!)}</span>
          </div>
          <p className="mb-2 line-clamp-2 font-semibold leading-snug text-gray-900">{article.title}</p>
          <Link
            href={`/news/${article.id}`}
            onClick={markSeen}
            tabIndex={visible ? 0 : -1}
            className="inline-flex items-center gap-1 text-sm font-semibold text-black hover:text-[#B8962E]"
          >
            Read article <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <button
          type="button"
          onClick={markSeen}
          tabIndex={visible ? 0 : -1}
          aria-label="Dismiss"
          className="absolute right-2 top-2 rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </aside>
  )
}
