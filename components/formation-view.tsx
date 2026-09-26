"use client"

import { useMemo } from "react"
import { formatPlayerName } from "@/utils/format-player-name"
import { calculatePositionChemistry } from "@/utils/calculate-chemistry"
import { FORMATIONS } from "@/utils/formations"
import type { PlayerWithStats } from "@/types/supabase"
import { useIsMobile } from "@/hooks/use-mobile"

interface FormationViewProps {
  formation: string
  players: PlayerWithStats[]
  substitutes: PlayerWithStats[]
}

// Pixel coordinates in the same order as FORMATIONS[formation], so a
// player's index (== its position_order - 1) maps directly to a slot's
// coordinates instead of relying on object key insertion order.
const FORMATION_LAYOUTS: Record<string, { top: string; left: string }[]> = {
  "4-3-3": [
    { top: "85%", left: "50%" }, // GK
    { top: "74%", left: "80%" }, // RB
    { top: "74%", left: "60%" }, // CB
    { top: "74%", left: "40%" }, // CB
    { top: "74%", left: "20%" }, // LB
    { top: "56%", left: "50%" }, // CDM
    { top: "48%", left: "36%" }, // CM
    { top: "48%", left: "64%" }, // CM
    { top: "15%", left: "50%" }, // ST
    { top: "22%", left: "72%" }, // RW
    { top: "22%", left: "28%" }, // LW
  ],
  "4-4-2": [
    { top: "85%", left: "50%" }, // GK
    { top: "70%", left: "80%" }, // RB
    { top: "70%", left: "60%" }, // CB
    { top: "70%", left: "40%" }, // CB
    { top: "70%", left: "20%" }, // LB
    { top: "45%", left: "80%" }, // RM
    { top: "45%", left: "60%" }, // CM
    { top: "45%", left: "40%" }, // CM
    { top: "45%", left: "20%" }, // LM
    { top: "15%", left: "35%" }, // ST
    { top: "15%", left: "65%" }, // ST
  ],
  "3-5-2": [
    { top: "92%", left: "50%" }, // GK
    { top: "75%", left: "25%" }, // CB
    { top: "75%", left: "50%" }, // CB
    { top: "75%", left: "75%" }, // CB
    { top: "48%", left: "80%" }, // RM
    { top: "60%", left: "35%" }, // CM
    { top: "60%", left: "65%" }, // CM
    { top: "40%", left: "50%" }, // CAM
    { top: "48%", left: "20%" }, // LM
    { top: "25%", left: "40%" }, // ST
    { top: "25%", left: "60%" }, // ST
  ],
}

// On phones the pitch is narrow, so the central midfielders are pushed this
// many percentage points further out from the middle to keep them apart.
const PHONE_CM_SPREAD = 6
// On desktop the back line sits this much further back towards our goal.
const DESKTOP_BACK_LINE_DROP = "5px"
const BACK_LINE = ["RB", "CB", "LB"]

export function FormationView({ formation, players, substitutes }: FormationViewProps) {
  const isMobile = useIsMobile()

  const positionedPlayers = useMemo(() => {
    const labels = FORMATIONS[formation] || []
    const layout = FORMATION_LAYOUTS[formation] || []

    return players.slice(0, 11).map((player, index) => {
      const currentPosition = labels[index]
      const chemistry = calculatePositionChemistry(
        currentPosition,
        // On the lineup page `position` is the slot being played, so compare against the
        // player's own position (natural_position) when it's there.
        (player as PlayerWithStats & { natural_position?: string }).natural_position ?? player.position,
        player.alternate_positions,
      )
      let displayPosition = layout[index]
      if (isMobile && currentPosition === "CM" && displayPosition) {
        const left = parseFloat(displayPosition.left)
        const outward = left < 50 ? -PHONE_CM_SPREAD : PHONE_CM_SPREAD
        displayPosition = { ...displayPosition, left: `${left + outward}%` }
      }
      if (!isMobile && BACK_LINE.includes(currentPosition) && displayPosition) {
        displayPosition = { ...displayPosition, top: `calc(${displayPosition.top} + ${DESKTOP_BACK_LINE_DROP})` }
      }
      return {
        ...player,
        displayPosition,
        currentPosition,
        chemistry,
      }
    })
  }, [players, formation, isMobile])

  const PlayerIcon = ({ player, currentPosition }: { player: PlayerWithStats; currentPosition?: string }) => {
    const playerImageSrc = player.image_url ? `/images/players/${player.image_url.split("/").pop()}` : "/placeholder.svg"

    return (
      <div className="flex flex-col items-center">
        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center mb-1 border-2 border-black relative overflow-hidden">
          <img
            src={playerImageSrc}
            alt={player.name}
            className="w-full h-full object-cover"
            onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.svg" }}
          />
          {player.shirt_number != null && (
            <div className="absolute -top-2 -right-2 bg-black text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] font-bold">
              {player.shirt_number}
            </div>
          )}
        </div>
        <div className="bg-black text-white text-[10px] px-1 py-0.5 rounded whitespace-nowrap hidden lg:block">
          {player.nickname ? formatPlayerName(player.name, player.nickname) : player.name}
        </div>
        <div className="bg-black text-white text-[10px] px-1 py-0.5 rounded whitespace-nowrap lg:hidden">
          {player.nickname || player.name.split(" ")[0]}
        </div>
        {currentPosition && (
          <div className="flex items-center mt-1 gap-1">
            <div className="text-white text-[10px] font-bold">{currentPosition}</div>
          </div>
        )}
      </div>
    )
  }

  return (
    <>
      <div className="relative w-full" style={{ height: "600px", background: "linear-gradient(to bottom, #4ade80, #22c55e)" }}>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-[80%] h-[90%] border-2 border-white/70 relative">
            {/* Sized by height and kept square, so it's a circle however wide the pitch is. */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-[22%] aspect-square rounded-full border-2 border-white/70" />
            <div className="absolute top-1/2 left-0 transform -translate-y-1/2 w-full h-0 border-t-2 border-white/70" />
            {/* Penalty areas, each with its arc (the "D") on the edge facing the pitch. The arc is
                a slice of a circle, like a real one centred on the penalty spot, so it meets the box
                line at an angle rather than curving into it: 4x as wide as tall, radius 250 on a
                400x100 box. On phones the box follows the pitch width; on the wider desktop pitch
                both box and arc follow the pitch height instead, so they keep their proportions. */}
            {/* No border on the goal-line side, so it doesn't double up with the pitch outline. */}
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-[72%] h-[18%] md:w-auto md:aspect-[10/3] border-2 border-b-0 border-white/70" />
            {/* 5 m box (goal area). */}
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-[30%] h-[7%] md:w-auto md:aspect-[10/3] border-2 border-b-0 border-white/70" />
            <svg className="absolute bottom-[18%] left-1/2 -translate-x-1/2 h-[4%] md:h-[5%] aspect-[4/1] overflow-visible" viewBox="0 0 400 100" preserveAspectRatio="none">
              <path d="M0 100 A250 250 0 0 1 400 100" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2" vectorEffect="non-scaling-stroke" />
            </svg>
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-[72%] h-[18%] md:w-auto md:aspect-[10/3] border-2 border-t-0 border-white/70" />
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-[30%] h-[7%] md:w-auto md:aspect-[10/3] border-2 border-t-0 border-white/70" />
            <svg className="absolute top-[18%] left-1/2 -translate-x-1/2 h-[4%] md:h-[5%] aspect-[4/1] overflow-visible" viewBox="0 0 400 100" preserveAspectRatio="none">
              <path d="M0 0 A250 250 0 0 0 400 0" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2" vectorEffect="non-scaling-stroke" />
            </svg>
          </div>
        </div>

        {positionedPlayers.map((player) => (
          <div
            key={player.id}
            className="absolute transform -translate-x-1/2 -translate-y-1/2"
            style={{ top: player.displayPosition?.top, left: player.displayPosition?.left }}
          >
            <PlayerIcon player={player} currentPosition={player.currentPosition} />
          </div>
        ))}
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Substitutes</h2>
        <div className="flex flex-wrap justify-start gap-4">
          {substitutes.map((player) => (
            <PlayerIcon key={player.id} player={player} />
          ))}
        </div>
      </div>
    </>
  )
}
