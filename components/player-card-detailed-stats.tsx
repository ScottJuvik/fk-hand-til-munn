"use client"

import type { CSSProperties } from "react"
import { StarRating } from "@/components/star-rating"
import { SpecialtiesBadge } from "@/components/specialties-badge"
import { formatPlayerName } from "@/utils/format-player-name"
import type { PlayerWithStats } from "@/types/supabase"
import { getFlagUrl } from "@/utils/flag-url"
import { getCountryCode } from "@/utils/country-code"
import { getStatColor } from "@/utils/stat-colors"

interface PlayerCardDetailedStatsProps {
  player: PlayerWithStats
  /** Rating badge colours, to match the card theme of the dialog. */
  badgeStyle?: CSSProperties
  /** Player photo; falls back to the Messi photo if it doesn't load. Defaults to the lineup's photo path. */
  photoSrc?: string
}

type StatKey = keyof PlayerWithStats["stats"]

const MAIN_STATS: [string, StatKey][] = [
  ["Pace", "pace"],
  ["Shooting", "shooting"],
  ["Passing", "passing"],
  ["Dribbling", "dribbling"],
  ["Defending", "defending"],
  ["Physical", "physical"],
]

// The two columns of detailed stats.
const DETAILED_STATS: [string, StatKey][][] = [
  [
    ["Acceleration", "acceleration"],
    ["Sprint Speed", "sprint_speed"],
    ["Positioning", "positioning"],
    ["Finishing", "finishing"],
    ["Shot Power", "shot_power"],
    ["Long Shots", "long_shots"],
    ["Vision", "vision"],
    ["Crossing", "crossing"],
    ["Free Kick", "free_kick"],
    ["Short Passing", "short_passing"],
    ["Long Passing", "long_passing"],
    ["Curve", "curve"],
  ],
  [
    ["Agility", "agility"],
    ["Balance", "balance"],
    ["Reactions", "reactions"],
    ["Ball Control", "ball_control"],
    ["Dribbling", "dribbling"],
    ["Composure", "composure"],
    ["Interceptions", "interceptions"],
    ["Heading", "heading_accuracy"],
    ["Marking", "marking"],
    ["Standing Tackle", "standing_tackle"],
    ["Sliding Tackle", "sliding_tackle"],
    ["Jumping", "jumping"],
    ["Stamina", "stamina"],
    ["Strength", "strength"],
    ["Aggression", "aggression"],
  ],
]

export function PlayerCardDetailedStats({ player, badgeStyle, photoSrc }: PlayerCardDetailedStatsProps) {
  const displayName = player.nickname ? formatPlayerName(player.name, player.nickname) : player.name
  const playercardUrl = (player as PlayerWithStats & { playercard_url?: string }).playercard_url
  const playerImageSrc = photoSrc ?? (playercardUrl || "/images/players/messi.jpg")

  return (
    <div className="relative grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12 p-6 md:p-8 md:overflow-y-visible md:max-h-none overflow-y-auto max-h-[90vh]">
      <div className="flex flex-col items-center text-center">
        <div className="relative mb-4">
          <div
            className={`absolute -top-3 -right-3 font-bold rounded-full w-10 h-10 flex items-center justify-center text-xl border-2 ${badgeStyle ? "shadow-md" : "bg-yellow-400 text-black border-black"}`}
            style={badgeStyle}
          >
            {player.rating}
          </div>
          <img
            src={playerImageSrc}
            alt={player.name}
            className="h-40 w-40 object-cover rounded-lg"
            onError={(e) => {
              const img = e.target as HTMLImageElement
              if (photoSrc) {
                // Everyone without a working photo gets the Messi photo
                if (!img.src.endsWith("/images/players/messi.jpg")) img.src = "/images/players/messi.jpg"
              } else {
                img.src = "/placeholder.svg?height=240&width=180"
              }
            }}
          />
        </div>
        <h3 className="font-bold text-2xl mb-1">{displayName}</h3>
        <div className="text-sm text-gray-600 mb-4">
          {player.position}
        </div>
        <div className="grid grid-cols-1 gap-2 text-sm w-full max-w-[200px]">
          <div className="flex items-center gap-2">
            {player.nationality && (
              <div className="flex flex-col items-center  p-2 rounded flex-1">
                <img
                  src={getFlagUrl(getCountryCode(player.nationality), 32)}
                  alt={`${player.nationality} flag`}
                  className="w-8 h-8 mb-2 object-contain"
                />
                <span className="text-xs font-medium">{player.nationality}</span>
              </div>
            )}
            {player.club && (
              <div className="flex flex-col items-center  p-2 rounded flex-1">
                <img
                  src="/logos/club/htm-logo-round.png"
                  alt="FK Hånd til Munn logo"
                  className="w-8 h-8 mb-2 rounded-full object-contain shadow-sm"
                />
                <span className="text-xs font-medium">{player.club}</span>
              </div>
            )}
          </div>
          <div className="flex flex-col items-center  p-2 rounded">
            <span className="font-bold text-xl">#{player.shirt_number ?? "N/A"}</span>
            <span className="text-xs text-gray-600">Shirt No.</span>
          </div>
        </div>

        <div className="mt-4 p-3 rounded-lg w-full max-w-[200px] bg-white/55 backdrop-blur-sm ring-1 ring-white/60 shadow-sm">
          <h4 className="font-medium text-center mb-2">Work Rate</h4>
          <div className="flex justify-between text-sm">
            <div>
              <span className="text-gray-600">Attacking:</span>{" "}
              <span className="font-medium">{player.attacking_work_rate || "Medium"}</span>
            </div>
            <div>
              <span className="text-gray-600">Defensive:</span>{" "}
              <span className="font-medium">{player.defensive_work_rate || "Medium"}</span>
            </div>
          </div>
        </div>

        <div className="mt-4 p-3 rounded-lg w-full max-w-xs bg-white/55 backdrop-blur-sm ring-1 ring-white/60 shadow-sm">
          <div className="flex justify-around">
            <div className="flex flex-col items-center">
              <div className="text-sm font-medium mb-1">Weak Foot</div>
              <StarRating rating={player.weak_foot || 0} size="md" className="text-yellow-400" />
            </div>
            <div className="flex flex-col items-center">
              <div className="text-sm font-medium mb-1">Skill Moves</div>
              <StarRating rating={player.skill_moves || 0} maxRating={5} size="md" className="text-yellow-400" />
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-black/10 w-full flex justify-between items-end gap-4">
          {player.alternate_positions && (
            <div className="flex-1 text-left">
              <div className="text-sm text-gray-600 font-bold mb-1">Alternate Positions</div>
              <div className="flex flex-wrap gap-1">
                {player.alternate_positions.split(",").map((pos, index) => (
                  <span key={index} className="text-sm text-blue-600 cursor-pointer">
                    {pos.trim()}
                  </span>
                ))}
              </div>
            </div>
          )}

          {player.specialties && (
            <div className="flex-1 text-center">
              <div className="text-sm text-center text-gray-600 font-bold mb-1">Specialties</div>
              <SpecialtiesBadge specialties={player.specialties} className="justify-center" />
            </div>
          )}
        </div>
      </div>

      {/* Frosted glass so the stats stay readable over the card theme */}
      <div className="rounded-xl bg-white/60 backdrop-blur-md ring-1 ring-white/70 shadow-sm p-4 md:p-5">
        <h4 className="font-bold text-lg mb-2">Main Attributes</h4>
        <div className="grid grid-cols-2 gap-4 mb-6">
          {MAIN_STATS.map(([label, key]) => (
            <div key={key}>
              <div className="flex justify-between items-center mb-1">
                <span>{label}</span>
                <span className={`${getStatColor(player.stats[key])} px-2 rounded`}>{player.stats[key]}</span>
              </div>
              <div className="w-full bg-black/10 rounded-full h-2">
                <div
                  className={`${getStatColor(player.stats[key])} rounded-full h-2 transition-all duration-500`}
                  style={{ width: `${player.stats[key]}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>

        <h4 className="font-bold text-lg mb-2">Detailed Stats</h4>
        <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
          {DETAILED_STATS.map((column, index) => (
            <div key={index} className="flex flex-col space-y-2">
              {column.map(([label, key]) => (
                <div key={key} className="flex justify-between items-center">
                  <span>{label}</span>
                  <span className={`${getStatColor(player.stats[key])} px-2 rounded`}>{player.stats[key]}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
