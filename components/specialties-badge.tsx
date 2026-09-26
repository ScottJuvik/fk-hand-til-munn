import { Badge } from "@/components/ui/badge"

interface SpecialtiesBadgeProps {
  specialties: string | null
  limit?: number
  className?: string
}

export function SpecialtiesBadge({ specialties, limit = 2, className = "" }: SpecialtiesBadgeProps) {
  if (!specialties) return null

  const specialtiesList = specialties.split(",")
  const displayedSpecialties = limit ? specialtiesList.slice(0, limit) : specialtiesList
  const hasMore = specialtiesList.length > displayedSpecialties.length

  return (
    <div className={`flex flex-wrap gap-1 ${className}`}>
      {displayedSpecialties.map((specialty, index) => (
        <Badge key={index} variant="outline" className="bg-white/90 text-gray-900 border-black/15 shadow-sm font-semibold text-xs">
          {specialty.trim()}
        </Badge>
      ))}
      {hasMore && (
        <Badge variant="outline" className="bg-white/90 text-gray-900 border-black/15 shadow-sm font-semibold text-xs">
          +{specialtiesList.length - displayedSpecialties.length} more
        </Badge>
      )}
    </div>
  )
}
