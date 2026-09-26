// Extracts a representative brand color from a team logo image by sampling
// its pixels client-side and picking the most common saturated color.
export function getDominantColor(src: string, fallback = "#9CA3AF"): Promise<string> {
  return new Promise((resolve) => {
    if (!src) {
      resolve(fallback)
      return
    }

    const img = new Image()
    img.crossOrigin = "anonymous"

    img.onload = () => {
      try {
        const size = 32
        const canvas = document.createElement("canvas")
        canvas.width = size
        canvas.height = size

        const ctx = canvas.getContext("2d")
        if (!ctx) {
          resolve(fallback)
          return
        }

        ctx.drawImage(img, 0, 0, size, size)
        const { data } = ctx.getImageData(0, 0, size, size)

        const colorCounts = new Map<string, number>()

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i]
          const g = data[i + 1]
          const b = data[i + 2]
          const a = data[i + 3]

          if (a < 200) continue

          const max = Math.max(r, g, b)
          const min = Math.min(r, g, b)
          const lightness = (max + min) / 2

          // Skip near-white, near-black, and low-saturation (gray) pixels
          // so the logo's actual brand color wins over background/outline pixels.
          if (lightness > 235 || lightness < 20 || max - min < 25) continue

          const key = `${Math.round(r / 16)}-${Math.round(g / 16)}-${Math.round(b / 16)}`
          colorCounts.set(key, (colorCounts.get(key) || 0) + 1)
        }

        let bestKey: string | null = null
        let bestCount = 0
        for (const [key, count] of colorCounts) {
          if (count > bestCount) {
            bestCount = count
            bestKey = key
          }
        }

        if (!bestKey) {
          resolve(fallback)
          return
        }

        const [r, g, b] = bestKey.split("-").map((n) => Number(n) * 16)
        resolve(`rgb(${r}, ${g}, ${b})`)
      } catch {
        resolve(fallback)
      }
    }

    img.onerror = () => resolve(fallback)
    img.src = src
  })
}
