// Colour for a stat value, used for both the stat badges and the progress bars.
export const getStatColor = (value: number) => {
  if (value >= 90) return "bg-green-500"
  if (value >= 80) return "bg-green-400"
  if (value >= 70) return "bg-yellow-400"
  if (value >= 60) return "bg-orange-400"
  return "bg-red-500"
}
