"use client"

import { Calendar, User } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface ArticlePreviewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  author: string
  date: string
  image: string
  content: string
}

export function ArticlePreviewDialog({
  open,
  onOpenChange,
  title,
  author,
  date,
  image,
  content,
}: ArticlePreviewDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Preview</DialogTitle>
        </DialogHeader>

        <div className="max-w-4xl mx-auto w-full">
          <h1 className="text-4xl font-bold mb-4">{title || "Untitled article"}</h1>

          <div className="flex flex-wrap items-center text-gray-500 mb-6 gap-4">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              <span>{date}</span>
            </div>
            <div className="flex items-center">
              <User className="h-4 w-4 mr-1" />
              <span>{author}</span>
            </div>
          </div>

          {image && (
            <div className="mb-8">
              <img
                src={image || "/placeholder.svg"}
                alt={title}
                className="w-full h-[400px] object-cover rounded-lg"
              />
            </div>
          )}

          <div
            className="max-w-[68ch] mx-auto text-[17px] leading-[1.85] text-gray-800
              [&>h2]:text-3xl [&>h2]:font-black [&>h2]:tracking-tight [&>h2]:mb-6 [&>h2]:mt-2 [&>h2]:text-black
              [&>p]:mb-6
              [&>p:first-of-type]:text-xl [&>p:first-of-type]:leading-relaxed [&>p:first-of-type]:font-medium [&>p:first-of-type]:text-gray-900
              [&_strong]:font-semibold [&_strong]:text-gray-900
              [&>blockquote]:my-8 [&>blockquote]:border-l-4 [&>blockquote]:border-black [&>blockquote]:bg-gray-50 [&>blockquote]:py-3 [&>blockquote]:pl-6 [&>blockquote]:pr-4 [&>blockquote]:italic [&>blockquote]:text-xl [&>blockquote]:leading-snug [&>blockquote]:text-gray-700"
            dangerouslySetInnerHTML={{ __html: content || "<p>Nothing written yet.</p>" }}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
