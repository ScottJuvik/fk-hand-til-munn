// FIFA 26 card tier by overall rating. Bronze and silver split into
// common/rare at the upper end of their range.
export function getFifaCardForRating(rating: number | null | undefined): string {
  const r = rating ?? 0
  if (r >= 83) return "/images/cards/templates/rare-gold.webp"
  if (r >= 75) return "/images/cards/templates/non-rare-gold.webp"
  if (r >= 70) return "/images/cards/templates/rare-silver.webp"
  if (r >= 65) return "/images/cards/templates/non-rare-silver.webp"
  if (r >= 60) return "/images/cards/templates/rare-bronze.webp"
  return "/images/cards/templates/non-rare-bronze.webp"
}

// Same tiers as getFifaCardForRating, as the smaller card without the stat
// row that is used on the lineup pitch.
export function getMiniCardForRating(rating: number | null | undefined): string {
  const r = rating ?? 0
  if (r >= 83) return "/images/cards/templates/rare-gold-mini.webp"
  if (r >= 75) return "/images/cards/templates/non-rare-gold-mini.webp"
  if (r >= 70) return "/images/cards/templates/rare-silver-mini.webp"
  if (r >= 65) return "/images/cards/templates/non-rare-silver-mini.webp"
  if (r >= 60) return "/images/cards/templates/rare-bronze-mini.webp"
  return "/images/cards/templates/non-rare-bronze-mini.webp"
}
