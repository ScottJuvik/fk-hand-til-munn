import { Star } from "lucide-react"

interface StarRatingProps {
  rating: number
  maxRating?: number
  size?: "sm" | "md" | "lg"
  className?: string
}

export function StarRating({ rating, maxRating = 5, size = "md", className = "" }: StarRatingProps) {
  const stars = []
  const starSizes = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  }
  const starSize = starSizes[size]

  // Ensure rating is a number and between 0 and maxRating
  const safeRating = Math.max(0, Math.min(maxRating, Number(rating) || 0))

  for (let i = 1; i <= maxRating; i++) {
    stars.push(
      <Star
        key={i}
        className={`${starSize} ${i <= safeRating ? "fill-yellow-400 text-yellow-400" : "text-gray-400"}`}
      />,
    )
  }

  return <div className={`flex ${className}`}>{stars}</div>
}
