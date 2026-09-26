"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Save, FileText, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LoadingSpinner } from "@/components/loading-spinner"
import { adminGetNewsArticle } from "@/actions/admin-data"
import { useToast } from "@/hooks/use-toast"
import { ImageInput } from "@/components/admin/image-input"
import { RichTextEditor } from "@/components/admin/rich-text-editor"
import { ArticlePreviewDialog } from "@/components/admin/article-preview-dialog"
import { useAuth } from "@/components/auth-provider"
import { AdminPageHeader } from "@/components/admin/admin-page-header"

export default function EditNewsArticle({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { userRole } = useAuth()
  const { toast } = useToast()
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [savingAs, setSavingAs] = useState<"draft" | "published" | null>(null)
  const [previewOpen, setPreviewOpen] = useState(false)

  const [title, setTitle] = useState("")
  const [excerpt, setExcerpt] = useState("")
  const [content, setContent] = useState("")
  const [image, setImage] = useState("")
  const [author, setAuthor] = useState("")
  const [publishedAt, setPublishedAt] = useState("")

  useEffect(() => {
    if (userRole !== "admin") {
      router.push("/login")
      return
    }
    setIsAuthorized(true)

    async function fetchArticle() {
      setIsLoading(true)
      try {
        const { data, error } = await adminGetNewsArticle(params.id)

        if (error || !data) {
          console.error("Error fetching article:", error)
          toast({ title: "Article not found", variant: "destructive" })
          router.push("/admin/news")
          return
        }

        setTitle(data.title)
        setExcerpt(data.excerpt)
        setContent(data.content)
        setImage(data.image || "")
        setAuthor(data.author || "")
        setPublishedAt(data.published_at ? data.published_at.slice(0, 10) : "")
      } catch (error) {
        console.error("Error:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchArticle()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router, params.id])

  const handleSave = async (status: "draft" | "published") => {
    setSavingAs(status)

    try {
      const response = await fetch(`/api/news/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          excerpt,
          content,
          image: image || null,
          author,
          published_at: publishedAt,
          status,
        }),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error || "Failed to update article")
      }

      toast({ title: status === "draft" ? "Draft saved" : "Article updated" })
      router.push("/admin/news")
    } catch (error) {
      console.error("Error updating article:", error)
      toast({
        title: "Failed to update article",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      })
    } finally {
      setSavingAs(null)
    }
  }

  if (isLoading) {
    return <LoadingSpinner label="Loading article" />
  }

  if (!isAuthorized) {
    return null // Router will redirect
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <main className="container mx-auto py-8 px-4">
        <AdminPageHeader title="Edit Article" backHref="/admin/news" backLabel="News" />

        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle>Article</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="Enter article title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="excerpt">Excerpt</Label>
              <Textarea
                id="excerpt"
                placeholder="A short summary shown in article lists"
                rows={3}
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Content</Label>
              <RichTextEditor value={content} onChange={setContent} />
            </div>

            <ImageInput value={image} onChange={setImage} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="author">Author</Label>
                <Input id="author" value={author} onChange={(e) => setAuthor(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="publishedAt">Publish Date</Label>
                <Input
                  id="publishedAt"
                  type="date"
                  value={publishedAt}
                  onChange={(e) => setPublishedAt(e.target.value)}
                />
              </div>
            </div>

            <div className="pt-4 flex flex-wrap justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setPreviewOpen(true)}>
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={savingAs !== null}
                onClick={() => handleSave("draft")}
              >
                <FileText className="h-4 w-4 mr-2" />
                {savingAs === "draft" ? "Saving..." : "Save Draft"}
              </Button>
              <Button
                type="button"
                className="bg-black"
                disabled={savingAs !== null}
                onClick={() => handleSave("published")}
              >
                <Save className="h-4 w-4 mr-2" />
                {savingAs === "published" ? "Saving..." : "Publish"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>

      <ArticlePreviewDialog
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        title={title}
        author={author}
        date={
          publishedAt
            ? new Date(publishedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
            : ""
        }
        image={image}
        content={content}
      />
    </div>
  )
}
