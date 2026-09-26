"use client"

import { useRef, useState } from "react"
import { Upload, Link2, X, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"

interface ImageInputProps {
  value: string
  onChange: (url: string) => void
}

export function ImageInput({ value, onChange }: ImageInputProps) {
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/news/upload-image", {
        method: "POST",
        body: formData,
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(data.error || "Failed to upload image")
      }

      onChange(data.url)
      toast({ title: "Image uploaded" })
    } catch (error) {
      console.error("Error uploading image:", error)
      toast({
        title: "Failed to upload image",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  return (
    <div className="space-y-3">
      <Label>Image</Label>

      {value && (
        <div className="relative w-full max-w-sm">
          <img
            src={value || "/placeholder.svg"}
            alt="Article image preview"
            className="w-full h-40 object-cover rounded-md border"
          />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 h-7 w-7"
            onClick={() => onChange("")}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      <Tabs defaultValue="upload">
        <TabsList>
          <TabsTrigger value="upload">
            <Upload className="h-4 w-4 mr-1" />
            Upload
          </TabsTrigger>
          <TabsTrigger value="link">
            <Link2 className="h-4 w-4 mr-1" />
            Link
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="pt-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={handleFileSelect}
            className="hidden"
            id="image-upload-input"
          />
          <Button
            type="button"
            variant="outline"
            disabled={isUploading}
            onClick={() => fileInputRef.current?.click()}
          >
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Choose a photo from your computer
              </>
            )}
          </Button>
        </TabsContent>

        <TabsContent value="link" className="pt-2">
          <Input
            placeholder="https://example.com/photo.jpg"
            value={value.startsWith("http") ? value : ""}
            onChange={(e) => onChange(e.target.value)}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
