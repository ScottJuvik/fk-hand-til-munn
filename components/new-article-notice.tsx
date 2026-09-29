"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { ArrowRight, X } from "lucide-react"
import type { NewsArticle } from "@/data/news"

// Card in the corner of the home page when a news article was added to the
// site in the last 7 days. That's when it was created, not its publish date,
// which can be backdated to when the story happened. Each visitor sees it
// once per article: closing it or opening the article hides it until a
// newer one is added.

const NEW_FOR_DAYS = 7
const SEEN_KEY = "htm-news-notice-seen"
// Lets the page settle before the card slides in.
const SHOW_DELAY_MS = 1200

// Counted in calendar days, so last night is "Yesterday" even if it's under 24 hours ago.
function daysAgo(date: string) {
  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
  const days = Math.round((startOfDay(new Date()) - startOfDay(new Date(date))) / 86_400_000)
  if (days <= 0) return "Today"
  if (days === 1) return "Yesterday"
  return `${days} days ago`
}

export function NewArticleNotice({ articles, enabled }: { articles: NewsArticle[]; enabled: boolean }) {
  const [visible, setVisible] = useState(false)

  // The most recently added article, if it's recent enough. (Drafts never
  // reach this list.)
  const article = useMemo(() => {
    const newest = articles
      .filter((a) => a.createdAt)
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime())[0]
    if (!newest) return null
    const age = Date.now() - new Date(newest.createdAt!).getTime()
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
      {/* The whole card is the link; the dismiss button sits on top of it,
          outside the link, so closing never opens the article. The lift is
          on this wrapper so the button moves with the card. */}
      <div className="group relative transition-transform duration-200 hover:-translate-y-1 motion-reduce:transition-none motion-reduce:hover:translate-y-0">
        <Link
          href={`/news/${article.id}`}
          onClick={markSeen}
          tabIndex={visible ? 0 : -1}
          className="relative flex gap-4 overflow-hidden rounded-2xl bg-white p-3 pr-10 shadow-2xl ring-1 ring-black/5 transition duration-200 group-hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.35)] group-hover:ring-[#D4AF37]/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]"
        >
          <div className="absolute inset-y-0 left-0 w-1 bg-[#D4AF37] transition-all duration-200 group-hover:w-1.5" aria-hidden="true" />
          <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl">
            <img
              src={article.image}
              alt=""
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110 motion-reduce:transition-none"
            />
          </div>
          <div className="min-w-0 flex-1 py-0.5">
            <div className="mb-1 flex items-center gap-2 text-xs">
              <span className="rounded-full bg-[#D4AF37] px-2 py-0.5 font-bold uppercase tracking-wider text-black">
                New article
              </span>
              <span className="text-gray-500">{daysAgo(article.createdAt!)}</span>
            </div>
            <p className="mb-2 line-clamp-2 font-semibold leading-snug text-gray-900">{article.title}</p>
            <span className="inline-flex items-center gap-1 text-sm font-semibold text-black transition-colors group-hover:text-[#B8962E]">
              Read article
              <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
            </span>
          </div>
        </Link>
        <button
          type="button"
          onClick={markSeen}
          tabIndex={visible ? 0 : -1}
          aria-label="Dismiss"
          className="absolute right-2 top-2 z-10 rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </aside>
  )
}
