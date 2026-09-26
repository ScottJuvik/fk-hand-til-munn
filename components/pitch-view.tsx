"use client"

import { useMemo, useState, useRef, useLayoutEffect, useCallback } from "react"
import { PlayerPitchCard } from "@/components/player-pitch-card"
import { SubstitutesBench } from "@/components/substitutes-bench" // Import the new component
import { useIsMobile } from "@/hooks/use-mobile"
import { calculatePositionChemistry } from "@/utils/calculate-chemistry"
import type { PlayerWithStats } from "@/types/supabase"

interface PitchViewProps {
  formation: string
  players: PlayerWithStats[]
  substitutes?: PlayerWithStats[]
}

// Chemistry links for each formation, as pairs of position slots (in the order they're drawn).
const CHEMISTRY_LINKS: Record<string, [string, string][]> = {
  "4-3-3": [
    // Defensive links
    ["GK", "CB1"],
    ["GK", "CB2"],
    ["CB1", "CB2"],
    ["CB1", "RB"],
    ["CB2", "LB"],
    // Midfield links
    ["CB1", "CDM"],
    ["CB2", "CDM"],
    ["CDM", "CM1"],
    ["CDM", "CM2"],
    ["CM1", "CM2"],
    ["LB", "CM1"],
    ["RB", "CM2"],
    // Forward links
    ["CM1", "LW"],
    ["CM2", "RW"],
    ["CM1", "ST"],
    ["CM2", "ST"],
    ["LW", "ST"],
    ["RW", "ST"],
  ],
  "4-4-2": [
    // Defensive links
    ["GK", "CB1"],
    ["GK", "CB2"],
    ["CB1", "CB2"],
    ["CB1", "RB"],
    ["CB2", "LB"],
    // Midfield links
    ["RB", "RM"],
    ["LB", "LM"],
    ["RM", "CM1"],
    ["LM", "CM2"],
    ["CM1", "CM2"],
    // Each centre back links to the centre mid on his side (CB1/CM1 right, CB2/CM2 left).
    ["CB1", "CM1"],
    ["CB2", "CM2"],
    // Forward links, same side only: ST1 is the left striker and ST2 the right one.
    ["CM1", "ST2"],
    ["CM2", "ST1"],
    ["RM", "ST2"],
    ["LM", "ST1"],
    ["ST1", "ST2"],
  ],
  "3-5-2": [
    ["GK", "CB1"],
    ["GK", "CB2"],
    ["GK", "CB3"],
    ["CB1", "CB2"],
    ["CB2", "CB3"],
    ["LM", "CB1"],
    ["RM", "CB3"],
    ["CB1", "CM1"],
    ["CB2", "CM1"],
    ["CB2", "CM2"],
    ["CB3", "CM2"],
    ["CM1", "CM2"],
    ["LM", "CM1"],
    ["RM", "CM2"],
    ["CM1", "CAM"],
    ["CM2", "CAM"],
    ["CAM", "ST1"],
    ["CAM", "ST2"],
    ["ST1", "ST2"],
    ["LM", "ST1"],
    ["RM", "ST2"],
  ],
}

export function PitchView({ formation, players, substitutes = [] }: PitchViewProps) {
  const [teamRating, setTeamRating] = useState(0)
  const [teamChemistry, setTeamChemistry] = useState(0)

  // Formation positions
  // Phones: smaller cards, spread a little wider across the pitch so they don't pile on top of each other.
  const isMobile = useIsMobile()
  const PHONE_CARD_SCALE = 0.74
  const phoneLeft = (left?: string, positionKey?: string) => {
    if (!isMobile || !left) return left
    // Centre backs stay a little tighter than everyone else, so the pair sits close together.
    const factor = positionKey?.startsWith("CB") ? 0.95 : 1.18
    const spread = 50 + (parseFloat(left) - 50) * factor
    // Kept in from the edges so the widest players' cards stay fully on the pitch.
    return `${Math.min(86, Math.max(14, spread))}%`
  }

  // Phones: in the 4-3-3 the midfield three (CDM and both CMs) sit a little further up.
  const PHONE_MIDFIELD_LIFT = 4
  const phoneTop = (top?: string, positionKey?: string) => {
    if (!isMobile || !top || formation !== "4-3-3" || !/^(CDM|CM)/.test(positionKey ?? "")) return top
    return `${parseFloat(top) - PHONE_MIDFIELD_LIFT}%`
  }

  const formationPositions = useMemo(() => {
    switch (formation) {
      case "4-3-3":
        // Sits nearer our goal line like the 4-4-2, keeper where he is in the 3-5-2.
        // Full backs level with the centre backs; the striker a touch ahead of the wingers.
        return {
          GK: { top: "96%", left: "50%" },
          RB: { top: "78%", left: "85%" },
          CB1: { top: "78%", left: "63%" },
          CB2: { top: "78%", left: "37%" },
          LB: { top: "78%", left: "15%" },
          CDM: { top: "65%", left: "50%" },
          CM1: { top: "54%", left: "35%" },
          CM2: { top: "54%", left: "65%" },
          // Key order must match FORMATIONS["4-3-3"] (utils/formations.ts):
          // players are placed by lineup order, which ends ST, RW, LW.
          ST: { top: "25%", left: "50%" },
          RW: { top: "29%", left: "75%" },
          LW: { top: "29%", left: "25%" },
        }
      case "4-4-2":
        // Whole shape sits 6 points nearer our goal line, with the keeper where he is in the 3-5-2.
        return {
          GK: { top: "96%", left: "50%" },
          RB: { top: "76%", left: "85%" },
          CB1: { top: "76%", left: "63%" },
          CB2: { top: "76%", left: "37%" },
          LB: { top: "76%", left: "15%" },
          RM: { top: "51%", left: "80%" },
          CM1: { top: "51%", left: "60%" },
          CM2: { top: "51%", left: "40%" },
          LM: { top: "51%", left: "20%" },
          ST1: { top: "26%", left: "40%" },
          ST2: { top: "26%", left: "60%" },
        }
      case "3-5-2":
        return {
          GK: { top: "96%", left: "50%" },
          CB1: { top: "75%", left: "25%" },
          CB2: { top: "75%", left: "50%" },
          CB3: { top: "75%", left: "75%" },
          RM: { top: "45%", left: "85%" },
          CM1: { top: "60%", left: "35%" },
          CM2: { top: "60%", left: "65%" },
          CAM: { top: "45%", left: "50%" },
          LM: { top: "45%", left: "15%" },
          ST1: { top: "25%", left: "40%" },
          ST2: { top: "25%", left: "60%" },
        }
      default:
        return {}
    }
  }, [formation])

  // Map players to positions
  const positionedPlayers = useMemo(() => {
    const positions = Object.keys(formationPositions)
    return players.slice(0, 11).map((player, index) => {
      const positionKey = positions[index]
      const position = formationPositions[positionKey as keyof typeof formationPositions]
      const currentPosition = positionKey.replace(/\d+$/, "") // Remove numbers from position key
      const chemistry = calculatePositionChemistry(
        currentPosition,
        // On the lineup page `position` is the slot being played, so compare against the
        // player's own position (natural_position) when it's there.
        (player as PlayerWithStats & { natural_position?: string }).natural_position ?? player.position,
        player.alternate_positions,
      )

      return {
        ...player,
        positionKey,
        displayPosition: position,
        currentPosition,
        chemistryRating: chemistry.chemistry,
      }
    })
  }, [players, formationPositions])

  // Calculate team rating and chemistry
  useMemo(() => {
    if (positionedPlayers.length > 0) {
      const totalRating = positionedPlayers.reduce((sum, player) => sum + player.rating, 0)
      const avgRating = Math.round(totalRating / positionedPlayers.length)
      setTeamRating(avgRating)

      // Like FIFA: team chemistry is the players' chemistry added up, capped at 100.
      const totalChemistry = positionedPlayers.reduce((sum, player) => sum + (player.chemistryRating || 0), 0)
      setTeamChemistry(Math.min(100, totalChemistry))
    }
  }, [positionedPlayers])

  // Define chemistry links based on formation
  const chemistryLinks = useMemo(() => {
    const playerMap = positionedPlayers.reduce((map, player, index) => {
      const positions = Object.keys(formationPositions)
      map[positions[index]] = player
      return map
    }, {} as Record<string, (typeof positionedPlayers)[0]>)

    return (CHEMISTRY_LINKS[formation] ?? []).map(([from, to]) => ({ from, to, players: [playerMap[from], playerMap[to]] }))
  }, [formation, positionedPlayers, formationPositions])

  // Determine chemistry link color
  const GREEN_LINK = "rgba(0, 255, 0, 0.8)"
  // A link is only as strong as the weaker of its two players: green when both play their
  // main or an alternate position, orange when one is off position in a related spot, red
  // when one is completely off position.
  const getChemistryLinkColor = (players: Array<(typeof positionedPlayers)[0]>) => {
    if (!players[0] || !players[1]) return "rgba(255, 255, 255, 0.4)"
    const weakest = Math.min(players[0].chemistryRating, players[1].chemistryRating)
    if (weakest >= 9) return GREEN_LINK
    if (weakest >= 3) return "rgba(255, 165, 0, 0.8)"
    return "rgba(255, 0, 0, 0.8)"
  }

  // The tilted pitch is a real CSS 3D transform, so a card's rendered screen position
  // can't be derived from its top/left percentages with simple math. Instead, measure
  // each card's actual rendered position after paint and derive the chemistry lines
  // and bubbles from that, so they can never drift apart from the cards.
  const svgOverlayRef = useRef<SVGSVGElement>(null)
  const cardNodeRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const [nodePositions, setNodePositions] = useState<Record<string, { x: number; y: number }>>({})

  const recomputeNodePositions = useCallback(() => {
    const svg = svgOverlayRef.current
    if (!svg) return
    const svgRect = svg.getBoundingClientRect()
    const next: Record<string, { x: number; y: number }> = {}
    for (const [key, el] of Object.entries(cardNodeRefs.current)) {
      if (!el) continue
      const r = el.getBoundingClientRect()
      // Anchor at the card's bottom-center, not its true center: the chemistry
      // node sits below the card (where the links converge), not over the face.
      // The card art has ~7.44% transparent padding below the visible art
      // (flag/badge row) baked into every card image, so the box's own bottom
      // edge sits well below what's actually visible — pull the anchor up by
      // that same fraction of the rendered box height so it lands on the art.
      next[key] = {
        x: r.left + r.width / 2 - svgRect.left,
        y: r.bottom - r.height * 0.0744 - svgRect.top,
      }
    }
    setNodePositions(next)
  }, [])

  useLayoutEffect(() => {
    recomputeNodePositions()

    const ro = new ResizeObserver(() => recomputeNodePositions())
    if (svgOverlayRef.current?.parentElement) {
      ro.observe(svgOverlayRef.current.parentElement)
    }
    window.addEventListener("resize", recomputeNodePositions)
    return () => {
      ro.disconnect()
      window.removeEventListener("resize", recomputeNodePositions)
    }
  }, [recomputeNodePositions, positionedPlayers, formation, isMobile])

  return (
    <div className="flex flex-col items-center w-full">
      <div
        className="relative w-full overflow-hidden"
        // A bit shorter on phones, where the pitch is narrow.
        style={{ height: isMobile ? "600px" : "700px", perspective: "1000px", transformStyle: "preserve-3d" }}
      >
        {/* 3D Slanted Pitch */}
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{
            transform: "rotateX(25deg)",
            transformOrigin: "center center",
            transformStyle: "preserve-3d",
            height: "110%",
            top: "-5%",
          }}
        >
          <div
            className="w-[90%] h-[95%] border-2 border-white/70 relative bg-gradient-to-b from-green-600 to-green-800"
            style={{ boxShadow: "0 10px 30px rgba(0, 0, 0, 0.5)" }}
          >
            {/* Center circle */}
            {/* Kept square, so it's a circle however tall the pitch is (like on the Formation view). */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[30%] md:w-[18%] aspect-square rounded-full border-2 border-white/70" />
            {/* Center line */}
            <div className="absolute top-1/2 left-0 transform -translate-y-1/2 w-full h-0 border-t-2 border-white/70" />
            {/* Penalty areas, each with its arc (the "D"): a slice of a circle that meets the box
                line at an angle, like the one on the Formation view. Sized by width like the boxes.
                The pitch keeps its height on phones but gets much narrower, so there the boxes are
                shallower to keep their shape. */}
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-[60%] h-[11%] md:h-[20%] border-2 border-b-0 border-white/70" />
            {/* 5 m box (goal area) inside each penalty area. */}
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-[28%] h-[4%] md:h-[7%] border-2 border-white/70 border-b-0" />
            <svg className="absolute bottom-[11%] md:bottom-[20%] left-1/2 -translate-x-1/2 w-[24%] aspect-[4/1] overflow-visible" viewBox="0 0 400 100" preserveAspectRatio="none">
              <path d="M0 100 A250 250 0 0 1 400 100" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2" vectorEffect="non-scaling-stroke" />
            </svg>
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-[60%] h-[11%] md:h-[20%] border-2 border-t-0 border-white/70" />
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-[28%] h-[4%] md:h-[7%] border-2 border-white/70 border-t-0" />
            <svg className="absolute top-[11%] md:top-[20%] left-1/2 -translate-x-1/2 w-[24%] aspect-[4/1] overflow-visible" viewBox="0 0 400 100" preserveAspectRatio="none">
              <path d="M0 0 A250 250 0 0 0 400 0" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2" vectorEffect="non-scaling-stroke" />
            </svg>
          </div>
        </div>

        {/* Player cards — deliberately NOT nested inside the tilted plane above: composing the card's own
            counter-rotation with the plane's rotation in true 3D pushes part of the card past the perspective
            distance and clips it. Billboards upright under the outer perspective directly instead, same as before. */}
        {positionedPlayers.map((player) => (
          <div key={player.id} className="absolute" style={{ top: 0, left: 0, width: "100%", height: "100%" }}>
            <div
              ref={(el) => {
                cardNodeRefs.current[player.positionKey] = el
              }}
              className="absolute transition-transform duration-300 ease-in-out hover:scale-110"
              style={{
                top: `calc(${phoneTop(player.displayPosition?.top, player.positionKey)} - 135px)`,
                left: phoneLeft(player.displayPosition?.left, player.positionKey),
                zIndex: 10,
                // On phones the cards are scaled down (from their bottom centre, so they stay on
                // their spot). The scale lives on this measured node, so the links still meet the card.
                transform: `translate(-50%, 0) rotateX(-25deg)${isMobile ? ` scale(${PHONE_CARD_SCALE})` : ""}`,
                transformOrigin: "bottom center",
              }}
            >
              <PlayerPitchCard player={player} showMainAttributes={true} />
            </div>
          </div>
        ))}

        {/* Chemistry links and bubbles — derived from each card's actual rendered (post-3D-transform) position,
            measured via getBoundingClientRect, so they always terminate exactly at the card and can't drift apart. */}
        <svg ref={svgOverlayRef} className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 6 }}>
          <defs>
            {/* Blur only (no sharp copy on top), so the pulses read as a soft, diffuse glow. The
                region covers the whole pitch: sized from the line itself (the default), a perfectly
                horizontal or vertical link has a zero-height or zero-width box and the glow vanishes. */}
            <filter id="chemGlow" filterUnits="userSpaceOnUse" x="-100" y="-100" width="4000" height="4000">
              <feGaussianBlur stdDeviation="3" />
            </filter>
          </defs>
          {chemistryLinks.map((link, index) => {
            const from = nodePositions[link.from]
            const to = nodePositions[link.to]
            if (!from || !to) return null
            const strokeColor = getChemistryLinkColor(link.players)
            return (
              <g key={`link-${index}`}>
                <line x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke={strokeColor} strokeWidth={3} />
                {/* Every so often a soft glow sets off from both players' nodes, travels along the
                    link and fades out where the two pulses meet in the middle. Each half of the link
                    gets its own pulse (running node -> midpoint), both halves share the same timing,
                    and each link has its own start so they light up now and then, not all at once. */}
                {strokeColor === GREEN_LINK &&
                  [from, to].map((node, end) => {
                    const mid = { x: (from.x + to.x) / 2, y: (from.y + to.y) / 2 }
                    return (
                      <line
                        key={end}
                        x1={node.x}
                        y1={node.y}
                        x2={mid.x}
                        y2={mid.y}
                        stroke="rgba(215, 255, 215, 0.9)"
                        strokeWidth={6}
                        strokeLinecap="round"
                        pathLength={100}
                        strokeDasharray="30 100"
                        strokeDashoffset={30}
                        opacity={0}
                        filter="url(#chemGlow)"
                        className="motion-safe:animate-chem-meet motion-reduce:hidden"
                        style={{ animationDelay: `${((index * 1.3) % 6).toFixed(2)}s` }}
                      />
                    )
                  })}
              </g>
            )
          })}
        </svg>

        {positionedPlayers.map((player) => {
          const pos = nodePositions[player.positionKey]
          if (!pos) return null
          return (
            <div
              key={`chem-${player.id}`}
              className="absolute"
              style={{ top: pos.y, left: pos.x, transform: "translate(-50%, 4px)", zIndex: 11 }}
            >
              <div
                className={`rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold text-white border border-white shadow-lg
                  ${
                    // Same bands as the links: green in position, orange off position but related, red completely off.
                    player.chemistryRating >= 9
                      ? "bg-green-500"
                      : player.chemistryRating >= 3
                      ? "bg-orange-500"
                      : "bg-red-500"
                  }`}
              >
                {player.chemistryRating}
              </div>
            </div>
          )
        })}


        {/* FIFA-style header */}
        {/* Tighter on phones: smaller labels and values, and a shorter chemistry bar. */}
        <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-black via-black to-black/80 text-white px-3 py-2 md:p-4 grid grid-cols-3 items-center gap-2">
          <div className="text-left">
            <h3 className="text-[10px] md:text-sm uppercase tracking-wide text-gray-300 md:text-white">FORMATION</h3>
            <p className="text-base md:text-xl font-bold leading-tight">{formation}</p>
          </div>
          <div className="text-center">
            <h3 className="text-[10px] md:text-sm uppercase tracking-wide text-gray-300 md:text-white">RATING</h3>
            <div className="flex items-center justify-center">
              <div className="flex text-[10px] md:text-base">{[1, 2, 3, 4, 5].map((star) => <span key={star} className="text-yellow-400">★</span>)}</div>
              <span className="ml-1 md:ml-2 text-base md:text-xl font-bold leading-tight">{teamRating}</span>
            </div>
          </div>
          <div className="text-right">
            <h3 className="text-[10px] md:text-sm uppercase tracking-wide text-gray-300 md:text-white">CHEMISTRY</h3>
            {/* Green (the same green as the links) at 90+, orange from 50, red below. At a perfect
                100 the same soft pulse as the green links runs in from each end of the bar and fades
                where they meet in the middle. It's drawn on top of the bar rather than inside the
                rounded track, so its glow can spill over the header like the link glow does over the
                grass instead of being clipped away. */}
            <div className="flex items-center justify-end">
              <div className="relative w-10 h-2 md:w-32 md:h-4">
                <div className="h-full w-full bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${
                      teamChemistry >= 90
                        ? ""
                        : teamChemistry >= 50
                          ? "bg-gradient-to-r from-orange-400 to-orange-500"
                          : "bg-gradient-to-r from-red-500 to-red-600"
                    }`}
                    style={{ width: `${teamChemistry}%`, ...(teamChemistry >= 90 ? { background: GREEN_LINK } : {}) }}
                  ></div>
                </div>
                {teamChemistry >= 100 && (
                  <svg className="pointer-events-none absolute inset-0 h-full w-full overflow-visible" aria-hidden>
                    {[
                      ["0%", "50%"],
                      ["100%", "50%"],
                    ].map(([start, mid]) => (
                      <line
                        key={start}
                        x1={start}
                        y1="50%"
                        x2={mid}
                        y2="50%"
                        stroke="rgba(215, 255, 215, 0.9)"
                        // Wider than the bar, like the link glow is wider than its line, so it spills over the
                        // top and bottom edges. Flat ends and a clip keep it from reaching past either end.
                        strokeWidth={isMobile ? 12 : 22}
                        strokeLinecap="butt"
                        clipPath="url(#chemBarClip)"
                        pathLength={100}
                        strokeDasharray="30 100"
                        strokeDashoffset={30}
                        opacity={0}
                        filter="url(#chemGlowBar)"
                        className="motion-safe:animate-chem-meet motion-reduce:hidden"
                      />
                    ))}
                    <defs>
                      <filter id="chemGlowBar" filterUnits="userSpaceOnUse" x="-100" y="-100" width="1000" height="300">
                        <feGaussianBlur stdDeviation="3" />
                      </filter>
                      {/* A pill the bar's length and a little taller than it, with fully rounded ends, so
                          the glow spills softly above and below and curves round the ends like the bar. */}
                      <clipPath id="chemBarClip">
                        <rect
                          x="0"
                          y={-(isMobile ? 3 : 5)}
                          width="100%"
                          height={isMobile ? 8 + 6 : 16 + 10}
                          rx={(isMobile ? 8 + 6 : 16 + 10) / 2}
                        />
                      </clipPath>
                    </defs>
                  </svg>
                )}
              </div>
              <span
                className={`ml-1 md:ml-2 text-base md:text-xl font-bold leading-tight ${
                  teamChemistry >= 90 ? "" : teamChemistry >= 50 ? "text-orange-400" : "text-red-500"
                }`}
                style={teamChemistry >= 90 ? { color: GREEN_LINK } : undefined}
              >
                {teamChemistry}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      {/* New Substitutes Bench component */}
      <SubstitutesBench substitutes={substitutes} />
      
    </div>
  )
}
