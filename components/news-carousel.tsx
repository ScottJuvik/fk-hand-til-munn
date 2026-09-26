"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import type { NewsArticle } from "@/data/news"

interface NewsCarouselProps {
  articles: NewsArticle[]
}

export function NewsCarousel({ articles }: NewsCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)
  const carouselRef = useRef<HTMLDivElement>(null)

  const handlePrev = () => {
    setActiveIndex((prev) => (prev === 0 ? articles.length - 1 : prev - 1))
  }

  const handleNext = () => {
    setActiveIndex((prev) => (prev === articles.length - 1 ? 0 : prev + 1))
  }

  // Mouse drag functionality
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!carouselRef.current) return
    setIsDragging(true)
    setStartX(e.pageX - carouselRef.current.offsetLeft)
    setScrollLeft(carouselRef.current.scrollLeft)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !carouselRef.current) return
    e.preventDefault()
    const x = e.pageX - carouselRef.current.offsetLeft
    const walk = (x - startX) * 2 // Scroll speed multiplier
    carouselRef.current.scrollLeft = scrollLeft - walk
  }

  const handleMouseUp = () => {
    setIsDragging(false)
    if (!carouselRef.current) return

    // Determine which item is most visible and set it as active
    const itemWidth = carouselRef.current.offsetWidth
    const scrollPosition = carouselRef.current.scrollLeft
    const newIndex = Math.round(scrollPosition / itemWidth)
    setActiveIndex(Math.max(0, Math.min(newIndex, articles.length - 1)))

    // Smooth scroll to the active item
    carouselRef.current.scrollTo({
      left: newIndex * itemWidth,
      behavior: "smooth",
    })
  }

  // Auto-scroll to the active item when activeIndex changes
  useEffect(() => {
    if (!carouselRef.current) return
    const itemWidth = carouselRef.current.offsetWidth
    carouselRef.current.scrollTo({
      left: activeIndex * itemWidth,
      behavior: "smooth",
    })
  }, [activeIndex])

  return (
    <div className="relative">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">Latest News</h2>
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={handlePrev}
            aria-label="Previous news"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleNext}
            aria-label="Next news"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div
        ref={carouselRef}
        className="overflow-x-auto flex snap-x snap-mandatory scrollbar-hide"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {articles.map((article, index) => (
          <div key={article.id} className="min-w-full snap-center px-4">
            <Link href={`/news/${article.id}`} className="block">
              <div className="border border-gray-200 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow cursor-pointer">
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={article.image || "/placeholder.svg"}
                    alt={article.title}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                  />
                </div>
                <div className="p-6">
                  <div className="flex items-center text-gray-500 mb-2">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span className="text-sm">{article.date}</span>
                  </div>
                  <h3 className="text-xl font-bold mb-2">{article.title}</h3>
                  <p className="text-gray-600 mb-4">{article.excerpt}</p>
                  <Button className="w-full">Read More</Button>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>

      {/* Indicator dots */}
      <div className="flex justify-center mt-4 space-x-2">
        {articles.map((_, index) => (
          <button
            key={index}
            onClick={() => setActiveIndex(index)}
            className={`w-2 h-2 rounded-full transition-colors ${index === activeIndex ? "bg-black" : "bg-gray-300"}`}
            aria-label={`Go to news item ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}
