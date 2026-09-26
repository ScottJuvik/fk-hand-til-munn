"use client"

import { PlayerPitchCard } from "@/components/player-pitch-card"
import { formatShortPlayerName } from "@/utils/format-player-name"
import type { PlayerWithStats } from "@/types/supabase"
import { useMemo } from "react"

interface SubstitutesBenchProps {
  substitutes: PlayerWithStats[]
  totalSlots?: number
}

export function SubstitutesBench({ substitutes, totalSlots = 7 }: SubstitutesBenchProps) {
  const emptySlotsCount = useMemo(() => {
    return Math.max(0, totalSlots - substitutes.length)
  }, [substitutes, totalSlots])

  return (
    <div className="w-full bg-gray-800 p-2 border-t border-gray-700 mt-[0px] relative z-20">
      <div className="flex justify-start items-end h-28">
        
        {/* "SUB" Vertical Label - Now fills the entire div height */}
        <div className="relative w-8 h-full shrink-0 bg-gray-900 text-white flex items-start justify-center p-1 z-30">
          <span className="absolute transform -rotate-90 origin-center text-sm font-bold tracking-widest uppercase whitespace-nowrap pt-2">SUB</span>
        </div>
        
        {/* Player and empty slots container. Each slot is as wide as the visible card
            art, so cards and empty slots sit side by side without overlapping. The row
            is wider than a phone, so there it scrolls sideways inside the bench instead
            of stretching the whole page; on desktop it fits and stays unclipped so the
            hover lift and name label above the card still show. */}
        {/* On phones the scrolling row gets extra room on top (as padding, so the slots keep
            their height) for the tops of the cards and their names, which stick up above the
            bench and would otherwise be clipped by the scroll area. */}
        <div className="flex min-w-0 flex-1 items-end h-full gap-2 pl-2 max-md:overflow-x-auto max-md:overflow-y-hidden max-md:h-[calc(100%+3.5rem)] max-md:pt-14">
          {substitutes.map((player) => (
            <div key={player.id} className="group relative w-[84px] h-full shrink-0">
              <div className="relative h-full flex items-end justify-center transition-transform duration-300 ease-in-out group-hover:translate-y-[-10px]">
                <PlayerPitchCard player={player} showMainAttributes={true} />
                {/* Vertical name in the card's top-right corner. It runs down under the black
                    cropping strip, which cuts off long names. */}
                <div
                  className="absolute top-[-6px] right-[5px] [writing-mode:vertical-rl] whitespace-nowrap font-bold text-[0.65rem] leading-none pointer-events-none transition-opacity duration-200 group-hover:opacity-0"
                  style={{ color: "#2D2410" }}
                >
                  {formatShortPlayerName(player.name, player.nickname)}
                </div>
                {/* Name above the lifted card while hovered. */}
                <div className="absolute left-1/2 -translate-x-1/2 bottom-[calc(100%+18px)] px-2 py-0.5 rounded bg-black/80 text-white text-xs font-bold whitespace-nowrap pointer-events-none opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                  {formatShortPlayerName(player.name, player.nickname)}
                </div>
              </div>
            </div>
          ))}
          {Array.from({ length: emptySlotsCount }).map((_, index) => (
            <div
              key={`empty-${index}`}
              className="relative w-[84px] h-28 shrink-0 bg-gray-700/50 border border-gray-600 rounded-lg z-0"
            ></div>
          ))}

          {/* "RES" Vertical Label - Now fills the entire div height */}
          <div className="relative w-8 h-full shrink-0 bg-gray-900 text-white flex items-start justify-center p-1 z-30">
            <span className="absolute transform -rotate-90 origin-center text-sm font-bold tracking-widest uppercase whitespace-nowrap pt-2">RES</span>
          </div>

        </div>
        
      </div>
      {/* Cropping div */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-black z-20 pointer-events-none"></div> 
    </div>
  )
}
