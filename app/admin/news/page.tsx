"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Trash2, Plus, Eye, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { LoadingSpinner } from "@/components/loading-spinner"
import { adminGetNewsArticles } from "@/actions/admin-data"
import { useToast } from "@/hooks/use-toast"
import type { NewsArticleRow } from "@/types/supabase"
import { useAuth } from "@/components/auth-provider"
import { AdminPageHeader } from "@/components/admin/admin-page-header"

export default function ManageNews() {
  const router = useRouter()
  const { userRole } = useAuth()
  const { toast } = useToast()
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [articles, setArticles] = useState<NewsArticleRow[]>([])
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [articleToDelete, setArticleToDelete] = useState<number | null>(null)
  const [featuringId, setFeaturingId] = useState<number | null>(null)

  useEffect(() => {
    if (userRole !== "admin") {
      router.push("/login")
      return
    }
    setIsAuthorized(true)

    async function fetchArticles() {
      setIsLoading(true)
      try {
        const { data, error } = await adminGetNewsArticles()

        if (error) {
          console.error("Error fetching articles:", error)
          return
        }

        setArticles(data || [])
      } catch (error) {
        console.error("Error:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchArticles()
  }, [router])

  const handleSetFeatured = async (articleId: number) => {
    setFeaturingId(articleId)
    try {
      const response = await fetch(`/api/news/${articleId}/feature`, { method: "POST" })

      if (!response.ok) {
        throw new Error("Failed to set featured article")
      }

      setArticles(articles.map((article) => ({ ...article, is_featured: article.id === articleId })))
      toast({ title: "Featured article updated" })
    } catch (error) {
      console.error("Error setting featured article:", error)
      toast({ title: "Failed to update featured article", description: "Please try again.", variant: "destructive" })
    } finally {
      setFeaturingId(null)
    }
  }

  const handleDeleteClick = (articleId: number) => {
    setArticleToDelete(articleId)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (articleToDelete === null) return

    try {
      const response = await fetch(`/api/news/${articleToDelete}`, { method: "DELETE" })

      if (!response.ok) {
        throw new Error("Failed to delete article")
      }

      setArticles(articles.filter((article) => article.id !== articleToDelete))
      toast({ title: "Article deleted" })
    } catch (error) {
      console.error("Error deleting article:", error)
      toast({ title: "Failed to delete article", description: "Please try again.", variant: "destructive" })
    } finally {
      setDeleteDialogOpen(false)
      setArticleToDelete(null)
    }
  }

  if (isLoading) {
    return <LoadingSpinner label="Loading news" />
  }

  if (!isAuthorized) {
    return null // Router will redirect
  }

  // Shared by the desktop table and the phone cards.
  type Article = (typeof articles)[number]

  const publishedDate = (article: Article) =>
    article.published_at ? new Date(article.published_at).toLocaleDateString() : "—"

  const renderStatus = (article: Article) =>
    article.status === "draft" ? (
      <span className="inline-flex items-center rounded-full bg-gray-200 px-2 py-0.5 text-xs font-medium text-gray-700">
        Draft
      </span>
    ) : (
      <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
        Published
      </span>
    )

  const renderFeatured = (article: Article) =>
    article.is_featured ? (
      <span className="inline-flex items-center gap-1 text-sm font-medium text-amber-600">
        <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
        Featured
      </span>
    ) : (
      <Button
        variant="ghost"
        size="sm"
        className="text-gray-500"
        disabled={featuringId === article.id}
        onClick={(e) => {
          e.stopPropagation()
          handleSetFeatured(article.id)
        }}
      >
        <Star className="h-4 w-4 mr-1" />
        Make Featured
      </Button>
    )

  // The row (or card) itself opens the editor; the buttons inside stop the click.
  const openArticle = (id: number) => router.push(`/admin/news/edit/${id}`)

  const renderActions = (article: Article) => (
    <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
      <Button variant="outline" size="icon" asChild>
        <Link href={`/news/${article.id}`}>
          <Eye className="h-4 w-4" />
        </Link>
      </Button>
      <Button variant="destructive" size="icon" onClick={() => handleDeleteClick(article.id)}>
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-100">
      <main className="container mx-auto py-8 px-4">
        <AdminPageHeader
          title="Manage News"
          backHref="/admin/dashboard"
          backLabel="Dashboard"
          action={
            <Button asChild>
              <Link href="/admin/news/create">
                <Plus className="h-4 w-4 mr-2" />
                Write Article
              </Link>
            </Button>
          }
        />

        {/* Phones: one card per article, title on its own line, so rows stay short. */}
        <div className="md:hidden space-y-3">
          {articles.map((article) => (
            <div
              key={article.id}
              onClick={() => openArticle(article.id)}
              className="cursor-pointer rounded-lg bg-white p-4 shadow active:bg-gray-50"
            >
              <p className="font-semibold leading-snug">{article.title}</p>
              <p className="mt-1 text-sm text-gray-500">
                {article.author} · {publishedDate(article)}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {renderStatus(article)}
                {renderFeatured(article)}
              </div>
              <div className="mt-3 border-t pt-3">{renderActions(article)}</div>
            </div>
          ))}
          {articles.length === 0 && <p className="py-8 text-center text-gray-500">No articles yet.</p>}
        </div>

        <div className="hidden md:block bg-white rounded-lg shadow overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Author</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Featured</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {articles.map((article) => (
                <TableRow
                  key={article.id}
                  onClick={() => openArticle(article.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && e.target === e.currentTarget) openArticle(article.id)
                  }}
                  tabIndex={0}
                  aria-label={`Edit ${article.title}`}
                  className="cursor-pointer hover:bg-gray-50 focus-visible:outline-none focus-visible:bg-gray-100"
                >
                  <TableCell>{article.id}</TableCell>
                  <TableCell className="font-medium">{article.title}</TableCell>
                  <TableCell>{article.author}</TableCell>
                  <TableCell>{publishedDate(article)}</TableCell>
                  <TableCell>{renderStatus(article)}</TableCell>
                  <TableCell>{renderFeatured(article)}</TableCell>
                  <TableCell className="text-right">{renderActions(article)}</TableCell>
                </TableRow>
              ))}
              {articles.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-gray-500 py-8">
                    No articles yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </main>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this article? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
