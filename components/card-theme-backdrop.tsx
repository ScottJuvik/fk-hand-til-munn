import type { CSSProperties } from "react"

// Backgrounds for the player details dialog that echo the player's card:
// the same metal or marble palette, plus the card's signature detail
// (flowing silk sheen on rare cards, holo shards on the Cold/Konrad icons,
// a red ribbon glow on the Invincibles card, an aurora on Founding Fathers).
// Everything is CSS gradients and inline SVG, so there are no images to load.

interface CardTheme {
  /** Layered CSS backgrounds, top layer first. */
  background: string
  /** Dialog border colour. */
  border: string
  /** Rating badge fill and text. */
  badge: { background: string; color: string }
  /** Soft glow around the dialog. */
  glow: string
  /** Whether the light sweep runs across the dialog. */
  shine: boolean
  /** Inner frame drawn with inset shadows, like the trim on the card. */
  frame?: string
  /**
   * Toned down to a tint under a white wash (squad cards). Icons leave it
   * out and show their theme at full strength.
   */
  subtle?: boolean
  /** How much white the wash adds [in the middle, at the edges]; defaults to [0.82, 0.62]. */
  wash?: [number, number]
}

// An inline SVG as one background layer, stretched over the dialog.
const svg = (markup: string, size = "100% 100%", repeat = "no-repeat", position = "center") =>
  `url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' ${markup}</svg>`)}") ${position} / ${size} ${repeat}`

// Fine grain, so the gradients read as a surface rather than flat colour.
const GRAIN = svg(
  `width='180' height='180'><filter id='g'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.07 0'/></filter><rect width='180' height='180' filter='url(#g)'/>`,
  "180px 180px",
  "repeat",
)

// Soft folds of light sweeping across from the top right, like the silk
// sheen in the art of the FIFA 26 rare cards.
// Keeps its proportions and is anchored to the top right, so on a tall,
// narrow phone dialog you see a natural piece of the sheen rather than the
// whole thing stretched into lines running corner to corner.
const silk = (highlight: string, shade: string) =>
  svg(
    `viewBox='0 0 1000 600' preserveAspectRatio='xMaxYMin slice'>
      <defs>
        <filter id='b' x='-20%' y='-20%' width='140%' height='140%'><feGaussianBlur stdDeviation='22'/></filter>
        <filter id='s' x='-20%' y='-20%' width='140%' height='140%'><feGaussianBlur stdDeviation='40'/></filter>
        <filter id='l'><feGaussianBlur stdDeviation='0.8'/></filter>
      </defs>
      <path filter='url(#s)' fill='${shade}' d='M1060 250 C820 280 660 430 420 480 S110 560 -60 660 L1060 660 Z'/>
      <path filter='url(#b)' fill='${highlight}' d='M1040 30 C770 60 640 250 420 300 S90 410 -40 590 L-40 500 C120 370 360 240 560 190 S880 10 1040 -40 Z'/>
      <path filter='url(#b)' fill='${highlight}' opacity='0.6' d='M1040 330 C860 350 760 420 600 470 S330 560 200 640 L420 640 C520 580 700 510 820 470 S960 400 1040 390 Z'/>
      <g filter='url(#l)' fill='none' stroke='${highlight}' stroke-linecap='round'>
        <path stroke-width='2' d='M1040 10 C780 40 650 250 420 290 S90 400 -40 580'/>
        <path stroke-width='1.2' opacity='0.7' d='M1040 75 C800 105 680 300 440 345 S110 455 -40 645'/>
        <path stroke-width='1' opacity='0.5' d='M1040 -45 C760 -5 620 200 400 250 S60 360 -60 520'/>
      </g>`,
    "cover",
    "no-repeat",
    // Pushed down by --silk-y, which the dialog sets per screen size (CARD_THEME_DIALOG_CLASS).
    "right 0 top var(--silk-y, 0px)",
  )

// Thin sweeping arcs, like the curves on the non-rare cards.
const arcs = (color: string) =>
  `repeating-radial-gradient(circle at 120% -20%, transparent 0 46px, ${color} 47px 48px, transparent 49px 90px)`

const metal = (light: string, mid: string, dark: string, sheen: string) =>
  `linear-gradient(135deg, ${light} 0%, ${mid} 38%, ${dark} 72%, ${sheen} 100%)`

// Soft grey clouding for the marble, without any vein lines.
const MARBLE_CLOUDS = svg(
  `viewBox='0 0 1000 700' preserveAspectRatio='none'><filter id='c'><feTurbulence type='fractalNoise' baseFrequency='0.004 0.006' numOctaves='3' seed='3'/><feColorMatrix values='0 0 0 0 0.45 0 0 0 0 0.42 0 0 0 0 0.4 0 0 0 0.22 -0.06'/></filter><rect width='1000' height='700' filter='url(#c)'/>`,
)

// White marble shared by the icon cards.
const MARBLE = [
  MARBLE_CLOUDS,
  GRAIN,
  "radial-gradient(ellipse at 30% 20%, #ffffff 0%, transparent 60%)",
  "linear-gradient(135deg, #f7f5f3 0%, #e7e3df 50%, #f1eeea 100%)",
].join(", ")

// A ribbon sweeping up from the bottom left and twisting halfway, so you
// see its front face, then its darker back face. `id` keeps the gradient ids
// unique when one drawing holds several ribbons.
interface RibbonColors {
  /** Gradient stops along the front face. */
  front: string[]
  /** Gradient stops along the back face, after the twist. */
  back: string[]
  /** Stroke along the ribbon's two edges. */
  edge: string
  /** Width of the edge strokes. */
  edgeWidth: number
}

const stops = (colors: string[]) =>
  colors.map((c, i) => `<stop offset='${i / (colors.length - 1)}' stop-color='${c}'/>`).join("")

const ribbon = (id: string, c: RibbonColors, transform = "") => {
  // Both faces meet at the twist (540, 430).
  const front = "M-80 600 C120 520 300 560 540 430 C330 610 150 660 -80 720 Z"
  const back = "M540 430 C700 330 820 160 1080 110 L1080 230 C860 250 720 340 540 430 Z"
  // Each edge runs along one side of the front face and the other side of the back face.
  const edgeA = "M-80 600 C120 520 300 560 540 430 C720 340 860 250 1080 230"
  const edgeB = "M-80 720 C150 660 330 610 540 430 C700 330 820 160 1080 110"
  return `
    <defs>
      <linearGradient id='${id}f' gradientUnits='userSpaceOnUse' x1='-80' y1='660' x2='540' y2='430'>${stops(c.front)}</linearGradient>
      <linearGradient id='${id}b' gradientUnits='userSpaceOnUse' x1='540' y1='430' x2='1080' y2='170'>${stops(c.back)}</linearGradient>
    </defs>
    <g transform='${transform}'>
      <g filter='url(#shadow)' fill='rgba(60,30,20,0.22)' transform='translate(0 22)'><path d='${front}'/><path d='${back}'/></g>
      <path d='${front}' fill='url(#${id}f)'/>
      <path d='${back}' fill='url(#${id}b)'/>
      <g fill='none' stroke='${c.edge}' stroke-width='${c.edgeWidth}' stroke-linecap='round'><path d='${edgeA}'/><path d='${edgeB}' opacity='0.7'/></g>
    </g>`
}

// By default shifted left so the twist lands beside the photo instead of
// behind the stats panel.
const ribbons = (markup: string, shift = "translate(-130 30)") =>
  svg(
    `viewBox='0 0 1000 700' preserveAspectRatio='xMidYMid slice'>
      <defs>
        <filter id='shadow' x='-10%' y='-30%' width='120%' height='160%'><feGaussianBlur stdDeviation='18'/></filter>
        <linearGradient id='rosegold' x1='0' y1='1' x2='1' y2='0'>
          <stop offset='0' stop-color='#f6e2c8'/><stop offset='0.45' stop-color='#c9996c'/><stop offset='0.7' stop-color='#f1d6b4'/><stop offset='1' stop-color='#b3845c'/>
        </linearGradient>
      </defs>
      <g transform='${shift}'>${markup}</g>`,
    "cover",
  )

// The rose gold trimmed marble ribbons swirling behind the player on the
// baby icon card.
const PEARL: RibbonColors = {
  front: ["#fdfbf9", "#efe6dd", "#ffffff", "#e9dfd5"],
  back: ["#d9cabb", "#e8ddd2", "#cdbba9"],
  edge: "url(#rosegold)",
  edgeWidth: 3,
}
type Point = [number, number]
type Curve = [Point, Point, Point, Point]

const bezier = ([p0, p1, p2, p3]: Curve, t: number): Point => {
  const u = 1 - t
  return [0, 1].map((k) => u * u * u * p0[k] + 3 * u * u * t * p1[k] + 3 * u * t * t * p2[k] + t * t * t * p3[k]) as Point
}

// The same pearl ribbon as `ribbon`, but along any curve: full width at
// both ends, twisting to an edge halfway, front face then back face.
const curvedRibbon = (id: string, curve: Curve, c: RibbonColors, width: number) => {
  const f = (q: Point) => `${q[0].toFixed(1)} ${q[1].toFixed(1)}`
  const edge = (from: number, to: number, side: 1 | -1) =>
    Array.from({ length: 41 }, (_, i) => {
      const t = from + ((to - from) * i) / 40
      const p = bezier(curve, t)
      const prev = bezier(curve, Math.max(t - 0.001, 0))
      const next = bezier(curve, Math.min(t + 0.001, 1))
      const len = Math.hypot(next[0] - prev[0], next[1] - prev[1]) || 1
      const half = (width / 2) * Math.max(Math.abs(Math.cos(t * Math.PI)), 0.03) * side
      return [p[0] - ((next[1] - prev[1]) / len) * half, p[1] + ((next[0] - prev[0]) / len) * half] as Point
    })
  const face = (from: number, to: number) => {
    const [a, b] = [edge(from, to, 1), edge(from, to, -1).reverse()]
    return `M${[...a, ...b].map(f).join("L")}Z`
  }
  const [start, mid, end] = [bezier(curve, 0), bezier(curve, 0.5), bezier(curve, 1)]
  return `
    <defs>
      <linearGradient id='${id}f' gradientUnits='userSpaceOnUse' x1='${start[0]}' y1='${start[1]}' x2='${mid[0]}' y2='${mid[1]}'>${stops(c.front)}</linearGradient>
      <linearGradient id='${id}b' gradientUnits='userSpaceOnUse' x1='${mid[0]}' y1='${mid[1]}' x2='${end[0]}' y2='${end[1]}'>${stops(c.back)}</linearGradient>
    </defs>
    <g filter='url(#shadow)' fill='rgba(60,30,20,0.22)' transform='translate(0 22)'><path d='${face(0, 0.5)}'/><path d='${face(0.5, 1)}'/></g>
    <path d='${face(0, 0.5)}' fill='url(#${id}f)'/>
    <path d='${face(0.5, 1)}' fill='url(#${id}b)'/>
    <g fill='none' stroke='${c.edge}' stroke-width='${c.edgeWidth}' stroke-linecap='round'>
      <path d='M${edge(0, 1, 1).map(f).join("L")}'/><path d='M${edge(0, 1, -1).map(f).join("L")}' opacity='0.7'/>
    </g>`
}

// Both ribbons start from one point on the bottom edge, left of centre,
// rise and lean right, then bend round to run flat to the right and meet
// again at the end: one steeper on the left, the other flatter.
const UPPER: Curve = [[260, 760], [130, 260], [420, 120], [1060, 170]]
const LOWER: Curve = [[260, 760], [420, 420], [700, 300], [1060, 170]]
const RIBBON_WIDTH = 90

// Pearl bands bridging the two ribbons, made of the same material with the
// same rose gold edges. They are thickest in the middle and thinner towards
// the ends, alternate between light and warm pearl so neighbours stand
// apart, and all bow the same way, a little more the longer they are, like
// fabric trailing between the ribbons.
const LIGHT_PEARL = ["#ffffff", "#efe6dd", "#dccdbf"]
const WARM_PEARL = ["#f3e3d3", "#d9bfa6", "#bf9f82"]
const BRIDGES: { t: number; width: number }[] = [
  { t: 0.16, width: 10 },
  { t: 0.26, width: 22 },
  { t: 0.36, width: 38 },
  { t: 0.47, width: 26 },
  { t: 0.57, width: 44 },
  { t: 0.68, width: 30 },
  { t: 0.78, width: 18 },
  { t: 0.88, width: 9 },
]

// The space between the two ribbons' centre lines. Bands are clipped to it,
// so their ends are cut cleanly along the ribbons (and hidden under them)
// even where a ribbon narrows at its twist.
const BETWEEN_RIBBONS = (() => {
  const samples = (curve: Curve) => Array.from({ length: 49 }, (_, i) => bezier(curve, i / 48))
  const pts = [...samples(UPPER), ...samples(LOWER).reverse()]
  return `M${pts.map((q) => `${q[0].toFixed(1)} ${q[1].toFixed(1)}`).join("L")}Z`
})()

const bridge = ({ t, width }: { t: number; width: number }, index: number) => {
  const [a, b] = [bezier(UPPER, t), bezier(LOWER, t)]
  const len = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1
  const dir: Point = [(b[0] - a[0]) / len, (b[1] - a[1]) / len]
  const normal: Point = [-dir[1], dir[0]]
  // Run a little past both centre lines; the clip trims the ends.
  const from: Point = [a[0] - dir[0] * 20, a[1] - dir[1] * 20]
  const to: Point = [b[0] + dir[0] * 20, b[1] + dir[1] * 20]
  // Every band bows back towards where the ribbons start, as if trailing in
  // their flow, more for longer bands.
  const mid = (u: number): Point => {
    const [p, q] = [bezier(UPPER, u), bezier(LOWER, u)]
    return [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2]
  }
  const [before, after] = [mid(Math.max(t - 0.01, 0)), mid(Math.min(t + 0.01, 1))]
  const backwards = normal[0] * (before[0] - after[0]) + normal[1] * (before[1] - after[1])
  const sag = (backwards >= 0 ? 1 : -1) * len * 0.07
  const ctrl: Point = [(from[0] + to[0]) / 2 + normal[0] * sag, (from[1] + to[1]) / 2 + normal[1] * sag]
  // Points along the bent centreline (quadratic curve), offset to either side.
  const side = (offset: number) =>
    Array.from({ length: 17 }, (_, i) => {
      const u = i / 16
      const [w0, w1, w2] = [(1 - u) * (1 - u), 2 * (1 - u) * u, u * u]
      return [w0 * from[0] + w1 * ctrl[0] + w2 * to[0] + normal[0] * offset, w0 * from[1] + w1 * ctrl[1] + w2 * to[1] + normal[1] * offset] as Point
    })
  const f = (q: Point) => `${q[0].toFixed(1)} ${q[1].toFixed(1)}`
  const [left, right] = [side(width / 2), side(-width / 2)]
  const band = `M${[...left, ...[...right].reverse()].map(f).join("L")}Z`
  return `
    <defs>
      <linearGradient id='br${index}' gradientUnits='userSpaceOnUse' x1='${left[8][0]}' y1='${left[8][1]}' x2='${right[8][0]}' y2='${right[8][1]}'>${stops(index % 2 ? WARM_PEARL : LIGHT_PEARL)}</linearGradient>
    </defs>
    <path d='${band}' fill='rgba(60,30,20,0.22)' filter='url(#shadow)' transform='translate(0 10)'/>
    <path d='${band}' fill='url(#br${index})'/>
    <g fill='none' stroke='url(#rosegold)' stroke-width='2.2' stroke-linecap='round'>
      <path d='M${left.map(f).join("L")}'/><path d='M${right.map(f).join("L")}' opacity='0.75'/>
    </g>`
}

// Bridges go underneath, so the ribbons' edges run over their ends.
const BABY_RIBBONS = ribbons(
  `<defs><clipPath id='between'><path d='${BETWEEN_RIBBONS}'/></clipPath></defs>` +
    `<g clip-path='url(#between)'>${BRIDGES.map(bridge).join("")}</g>` +
    curvedRibbon("p1", UPPER, PEARL, RIBBON_WIDTH) +
    curvedRibbon("p2", LOWER, PEARL, RIBBON_WIDTH),
  "",
)

// The orange-to-magenta ribbon swirling behind the trophy on the Invincibles card.
const INVINCIBLES_RIBBON = ribbons(
  ribbon("inv", {
    front: ["#ffb24a", "#ff7a45", "#ff4f6d", "#e0247f"],
    back: ["#b3125e", "#d81b72", "#8e0f4d"],
    edge: "rgba(255,240,225,0.8)",
    edgeWidth: 2,
  }),
  // Sits a little higher than the default shift.
  "translate(-130 -15)",
)

// Angular gold shards fanning into the dialog from the top right and bottom left
// corners (angles run clockwise from straight up), like the gold 3D shapes on the
// champions icon card.
const GOLD_SHARDS = [
  "conic-gradient(from 188deg at 100% 0%, transparent 0deg 12deg, rgba(212,175,55,0.55) 12deg 26deg, transparent 26deg 33deg, rgba(255,221,130,0.5) 33deg 44deg, transparent 44deg 52deg, rgba(150,110,30,0.4) 52deg 61deg, transparent 61deg 360deg)",
  "conic-gradient(from 8deg at 0% 100%, transparent 0deg 14deg, rgba(184,134,11,0.45) 14deg 27deg, transparent 27deg 36deg, rgba(255,221,130,0.4) 36deg 47deg, transparent 47deg 360deg)",
  "radial-gradient(ellipse 55% 45% at 92% 10%, rgba(255,215,120,0.35), transparent 70%)",
].join(", ")

// A holographic burst near the top, like the explosion behind the player on the
// mid icon card: a bright core, thin cyan / violet / pink rays that fade out with
// distance (a marble-coloured wash sits over their outer part), and a few sparkles.
// In the gap between the photo and the stats panel, so the bright core shows.
const BURST_AT = "56% 11%"
const HOLO_BURST = [
  `radial-gradient(circle at ${BURST_AT}, rgba(255,255,255,0.95) 0, rgba(200,240,255,0.6) 3%, transparent 9%)`,
  "radial-gradient(circle at 49% 6%, rgba(255,255,255,0.9) 0, transparent 0.7%)",
  "radial-gradient(circle at 61% 30%, rgba(255,255,255,0.85) 0, transparent 0.6%)",
  "radial-gradient(circle at 52% 22%, rgba(190,245,255,0.9) 0, transparent 0.5%)",
  "radial-gradient(circle at 60% 4%, rgba(255,210,245,0.85) 0, transparent 0.5%)",
  // Soft iridescent glows at the edges (cyan left, pink right, violet along the bottom)
  // so they aren't plain marble. These sit above the wash below.
  "radial-gradient(ellipse 28% 55% at 0% 55%, rgba(90,215,235,0.22), transparent 70%)",
  "radial-gradient(ellipse 28% 55% at 100% 60%, rgba(240,150,215,0.2), transparent 70%)",
  "radial-gradient(ellipse 55% 28% at 50% 100%, rgba(160,130,230,0.2), transparent 70%)",
  `radial-gradient(circle at ${BURST_AT}, transparent 0 18%, rgba(245,242,239,0.55) 38%, rgba(245,242,239,0.97) 60%)`,
  `repeating-conic-gradient(from 0deg at ${BURST_AT}, rgba(90,215,235,0.55) 0deg 1.5deg, transparent 1.5deg 7deg, rgba(160,130,230,0.5) 7deg 8.5deg, transparent 8.5deg 14deg, rgba(240,150,215,0.45) 14deg 15.5deg, transparent 15.5deg 21deg)`,
].join(", ")

// A gold snowflake like the one on the Ice Cold card: six arms, each with two pairs of
// branches and a small crystal at the tip, drawn at (cx, cy) with arm length r.
const snowflake = (cx: number, cy: number, r: number, width: number, opacity: number) => {
  const arm = (angle: number) => {
    const rad = (angle * Math.PI) / 180
    const at = (d: number, off = 0) => {
      const a = rad + off
      return `${(cx + Math.cos(a) * d).toFixed(1)} ${(cy + Math.sin(a) * d).toFixed(1)}`
    }
    const branch = (d: number, len: number) => {
      const base = [cx + Math.cos(rad) * d, cy + Math.sin(rad) * d]
      return [-1, 1]
        .map((side) => {
          const a = rad + side * (Math.PI / 3.2)
          return `M${base[0].toFixed(1)} ${base[1].toFixed(1)}L${(base[0] + Math.cos(a) * len).toFixed(1)} ${(base[1] + Math.sin(a) * len).toFixed(1)}`
        })
        .join("")
    }
    return `M${at(0)}L${at(r)}${branch(r * 0.38, r * 0.3)}${branch(r * 0.64, r * 0.22)}M${at(r * 0.84, -0.12)}L${at(r)}L${at(r * 0.84, 0.12)}`
  }
  const d = [0, 60, 120, 180, 240, 300].map((a) => arm(a - 90)).join("")
  return `<g opacity='${opacity}'><path d='${d}' fill='none' stroke='url(#snowGold)' stroke-width='${width}' stroke-linecap='round' stroke-linejoin='round'/><circle cx='${cx}' cy='${cy}' r='${r * 0.1}' fill='none' stroke='url(#snowGold)' stroke-width='${width}'/></g>`
}

// The Ice Cold card's look: gold snowflakes over marble (placed where the photo and stats
// panels don't cover them), with a soft jade glow like the green light behind the player.
const ICE_COLD = [
  svg(
    `viewBox='0 0 1000 700' preserveAspectRatio='xMidYMid slice'>
      <defs>
        <linearGradient id='snowGold' x1='0' y1='0' x2='1' y2='1'>
          <stop offset='0' stop-color='#f6e2b0'/><stop offset='0.5' stop-color='#c9a24e'/><stop offset='1' stop-color='#e8cf8f'/>
        </linearGradient>
      </defs>
      ${snowflake(40, 300, 170, 8, 0.75)}
      ${snowflake(535, 70, 75, 5, 0.7)}
      ${snowflake(230, 660, 90, 5, 0.55)}
      ${snowflake(975, 40, 110, 6, 0.6)}`,
    "cover",
  ),
  // A jade green ribbon with gold edges, twisting through the marble like the green light
  // on the card.
  ribbons(
    ribbon("ice", {
      front: ["#bfeee0", "#6fcfb0", "#3fa98a", "#2d8c72"],
      back: ["#1f6e5a", "#2e8a70", "#175845"],
      edge: "#d7b56a",
      edgeWidth: 2.5,
    }),
  ),
  "radial-gradient(ellipse 55% 45% at 90% 20%, rgba(94,190,160,0.28), transparent 70%)",
  "radial-gradient(ellipse 45% 40% at 5% 90%, rgba(60,150,130,0.22), transparent 70%)",
  MARBLE,
].join(", ")

const ROSE_GOLD_BORDER = "#c9a27e"
// Rose gold trim just inside the edge, like the icon cards' frame.
const ROSE_GOLD_FRAME = "inset 0 0 0 6px rgba(255,255,255,0.55), inset 0 0 0 8px #d8b894, inset 0 0 0 9px rgba(140,100,70,0.35)"
const MARBLE_BADGE = { background: "linear-gradient(135deg, #f3e6d8, #c9a27e)", color: "#3b3024" }

const THEMES: Record<string, CardTheme> = {
  "rare-gold.webp": {
    background: [silk("rgba(255,248,220,0.9)", "rgba(150,110,40,0.45)"), GRAIN, metal("#f8e7b0", "#e3c167", "#c59f50", "#eace7b")].join(", "),
    border: "#b8913f",
    badge: { background: "linear-gradient(135deg, #fff1c4, #c59f50)", color: "#2d2410" },
    glow: "rgba(227,193,103,0.55)",
    shine: true,
    subtle: true,
    wash: [0.3, 0.05],
  },
  "non-rare-gold.webp": {
    background: [arcs("rgba(255,250,230,0.35)"), metal("#f5e6bd", "#dcbc6e", "#ccab64", "#e5cc89")].join(", "),
    border: "#c4a25a",
    badge: { background: "linear-gradient(135deg, #fbefcd, #ccab64)", color: "#2d2410" },
    glow: "rgba(220,188,110,0.45)",
    shine: false,
    subtle: true,
    wash: [0.3, 0.05],
  },
  "rare-silver.webp": {
    background: [silk("rgba(255,255,255,0.95)", "rgba(80,86,98,0.45)"), GRAIN, metal("#eef0f3", "#b3b7c0", "#848993", "#c9ccd3")].join(", "),
    border: "#7d828c",
    badge: { background: "linear-gradient(135deg, #ffffff, #969ba6)", color: "#1f2126" },
    glow: "rgba(160,165,178,0.55)",
    shine: true,
    subtle: true,
    wash: [0.3, 0.05],
  },
  "non-rare-silver.webp": {
    background: [arcs("rgba(255,255,255,0.4)"), metal("#eceef1", "#b5b7bf", "#9398a1", "#c6c8ce")].join(", "),
    border: "#8e929b",
    badge: { background: "linear-gradient(135deg, #f7f8fa, #9398a1)", color: "#1f2126" },
    glow: "rgba(160,165,178,0.4)",
    shine: false,
    subtle: true,
    wash: [0.3, 0.05],
  },
  "rare-bronze.webp": {
    background: [silk("rgba(255,236,218,0.9)", "rgba(140,70,35,0.45)"), GRAIN, metal("#f6d0b0", "#e39c66", "#c67c50", "#e9ae7f")].join(", "),
    border: "#a8653c",
    badge: { background: "linear-gradient(135deg, #ffe2c9, #c67c50)", color: "#2d1a0e" },
    glow: "rgba(218,145,95,0.5)",
    shine: true,
    subtle: true,
    wash: [0.3, 0.05],
  },
  "non-rare-bronze.webp": {
    background: [arcs("rgba(255,235,215,0.35)"), metal("#f3d3bb", "#dc9a6e", "#cd8b62", "#e2b08b")].join(", "),
    border: "#b57a55",
    badge: { background: "linear-gradient(135deg, #fbe3d1, #cd8b62)", color: "#2d1a0e" },
    glow: "rgba(220,154,110,0.4)",
    shine: false,
    subtle: true,
    wash: [0.3, 0.05],
  },
  "baby.webp": {
    background: [BABY_RIBBONS, MARBLE].join(", "),
    border: ROSE_GOLD_BORDER,
    badge: MARBLE_BADGE,
    glow: "rgba(201,162,126,0.45)",
    shine: true,
    frame: ROSE_GOLD_FRAME,
  },
  "invincibles.webp": {
    background: [
      INVINCIBLES_RIBBON,
      // Corner glows in the ribbon's colours. Top left: warm orange-gold with a pink haze.
      "radial-gradient(ellipse 28% 24% at 3% 4%, rgba(255,190,80,0.55), transparent 70%)",
      "radial-gradient(ellipse 48% 40% at 0% 0%, rgba(255,95,120,0.28), transparent 70%)",
      // Bottom right: magenta with an orange haze.
      "radial-gradient(ellipse 30% 26% at 97% 96%, rgba(224,36,127,0.5), transparent 70%)",
      "radial-gradient(ellipse 50% 42% at 100% 100%, rgba(255,122,69,0.28), transparent 70%)",
      "radial-gradient(ellipse 60% 45% at 95% 15%, rgba(224,69,58,0.45), transparent 70%)",
      "radial-gradient(ellipse 50% 40% at 85% 35%, rgba(243,156,56,0.35), transparent 70%)",
      "radial-gradient(ellipse 45% 35% at 5% 95%, rgba(194,24,91,0.25), transparent 70%)",
      MARBLE,
    ].join(", "),
    border: ROSE_GOLD_BORDER,
    badge: { background: "linear-gradient(135deg, #f39c38, #c2185b)", color: "#ffffff" },
    glow: "rgba(224,69,58,0.4)",
    shine: true,
    frame: ROSE_GOLD_FRAME,
  },
  // Marble with the card's holographic burst.
  "mid.webp": {
    background: [HOLO_BURST, MARBLE].join(", "),
    border: ROSE_GOLD_BORDER,
    badge: { background: "linear-gradient(135deg, #bdf3fa, #9f8ae0)", color: "#1c1830" },
    glow: "rgba(127,227,240,0.45)",
    shine: true,
    // The rose gold frame plus a faint violet glow just inside it.
    frame: `${ROSE_GOLD_FRAME}, inset 0 0 40px rgba(160,130,230,0.22)`,
  },
  // Solsiden on an evening in winter: dusky blue sky at the top, warm string lights glowing
  // along the middle, and icy white below.
  "solsiden.webp": {
    background: [
      "radial-gradient(ellipse 30% 12% at 20% 38%, rgba(255,190,110,0.45), transparent 70%)",
      "radial-gradient(ellipse 30% 12% at 55% 34%, rgba(255,205,130,0.4), transparent 70%)",
      "radial-gradient(ellipse 28% 12% at 88% 40%, rgba(255,180,100,0.4), transparent 70%)",
      "radial-gradient(ellipse 40% 30% at 90% 95%, rgba(208,22,27,0.18), transparent 70%)",
      "linear-gradient(180deg, #1c3f73 0%, #3f6aa3 26%, #c9d9ea 48%, #f1f5f9 70%, #ffffff 100%)",
    ].join(", "),
    border: "#c89b4e",
    badge: { background: "linear-gradient(135deg, #ffe7b3, #c89b4e)", color: "#2d2410" },
    glow: "rgba(255,190,110,0.45)",
    shine: true,
    frame: "inset 0 0 0 6px rgba(255,255,255,0.35), inset 0 0 0 8px #d8b06a, inset 0 0 0 9px rgba(90,60,20,0.35)",
  },
  "ice-cold.webp": {
    background: ICE_COLD,
    border: "#c9a24e",
    badge: { background: "linear-gradient(135deg, #e6fbf3, #5ebea0)", color: "#12332a" },
    glow: "rgba(94,190,160,0.45)",
    shine: true,
    frame: "inset 0 0 0 6px rgba(255,255,255,0.55), inset 0 0 0 8px #d7b56a, inset 0 0 0 9px rgba(80,60,20,0.3)",
  },
  "champions.webp": {
    // Marble with the card's gold shards and a gold frame.
    background: [GOLD_SHARDS, MARBLE].join(", "),
    border: "#c9a54a",
    badge: { background: "linear-gradient(135deg, #fff1c4, #c59f50)", color: "#2d2410" },
    glow: "rgba(212,175,55,0.5)",
    shine: true,
    frame: "inset 0 0 0 6px rgba(255,255,255,0.55), inset 0 0 0 8px #d9b85c, inset 0 0 0 9px rgba(120,90,30,0.35)",
  },
  "founding-fathers.webp": {
    // Aurora of mint, teal and the card's violet trim, with a silk sheen.
    background: [
      silk("rgba(255,255,255,0.55)", "rgba(76,29,149,0.25)"),
      GRAIN,
      "radial-gradient(ellipse 55% 45% at 92% 8%, rgba(139,92,246,0.55), transparent 70%)",
      "radial-gradient(ellipse 50% 40% at 6% 96%, rgba(109,63,209,0.45), transparent 70%)",
      "radial-gradient(ellipse 50% 50% at 72% 78%, rgba(45,212,191,0.5), transparent 70%)",
      "radial-gradient(ellipse 60% 50% at 25% 18%, rgba(214,255,232,0.95), transparent 70%)",
      "linear-gradient(160deg, #8cf9ba 0%, #5af69b 45%, #3fd98a 100%)",
    ].join(", "),
    border: "#6d3fd1",
    badge: { background: "linear-gradient(135deg, #8b5cf6, #1f0854)", color: "#ffffff" },
    glow: "rgba(109,63,209,0.45)",
    shine: true,
    frame: "inset 0 0 0 5px rgba(255,255,255,0.35), inset 0 0 0 8px #8b5cf6",
  },
}

const FALLBACK = THEMES["non-rare-gold.webp"]

/** Theme for a card image path such as "/images/cards/templates/rare-gold.webp". */
export function getCardTheme(cardImage: string): CardTheme {
  const file = cardImage.split("/").pop() ?? ""
  return THEMES[file] ?? FALLBACK
}

// White wash over the subtle themes so they read as a tint of the card:
// lightest in the middle, letting a little more colour through at the edges.
const wash = ([middle, edges]: [number, number] = [0.82, 0.62]) =>
  `radial-gradient(ellipse 80% 75% at 50% 45%, rgba(255,255,255,${middle}) 0%, rgba(255,255,255,${edges}) 100%)`

/**
 * Classes for the dialog box: how far the rare cards' silk lines sit below
 * the top on each screen size (only nudged down on desktop).
 */
export const CARD_THEME_DIALOG_CLASS = "[--silk-y:0px] md:[--silk-y:30px]"

/** Inline styles for the dialog box itself. */
export function cardThemeDialogStyle(theme: CardTheme): CSSProperties {
  return {
    // `background` on the dialog box stays put when its content scrolls on mobile.
    background: theme.subtle ? [wash(theme.wash), theme.background].join(", ") : theme.background,
    borderColor: theme.border,
    borderWidth: theme.subtle ? 1 : 2,
    boxShadow: [
      theme.frame ?? "inset 0 0 0 1px rgba(255,255,255,0.35)",
      theme.subtle ? `0 20px 50px -20px ${theme.glow}` : `0 25px 60px -15px ${theme.glow}`,
    ].join(", "),
  }
}

/** Light sweep across the dialog; place inside the (relative) dialog. */
export function CardThemeShine({ theme }: { theme: CardTheme }) {
  if (!theme.shine) return null
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]">
      <div
        className={`absolute -inset-y-1/2 -left-1/2 w-1/3 rotate-12 bg-gradient-to-r from-transparent to-transparent motion-safe:animate-card-shine motion-reduce:hidden ${theme.subtle ? "via-white/25" : "via-white/40"}`}
      />
    </div>
  )
}
