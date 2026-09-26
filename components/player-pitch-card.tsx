"use client"

import { useState } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { PlayerCardDetailedStats } from "@/components/player-card-detailed-stats"
import { getCountryCode } from "@/utils/country-code"
import { getMiniCardForRating } from "@/utils/fifa-card"
import { formatShortPlayerName } from "@/utils/format-player-name"
import type { PlayerWithStats } from "@/types/supabase"
import { getFlagUrl } from "@/utils/flag-url"
import { getPlayerCardImage } from "@/components/player-card"
import { getCardTheme, cardThemeDialogStyle, CardThemeShine, CARD_THEME_DIALOG_CLASS } from "@/components/card-theme-backdrop"

// Same dark brown as the text on the full-size cards.
const MINI_CARD_TEXT = "#2D2410"

interface PlayerPitchCardProps {
  player: PlayerWithStats
  showMainAttributes?: boolean
}

export function PlayerPitchCard({ player, showMainAttributes = false }: PlayerPitchCardProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const fifaCardSrc = player.image_url || "/images/cards/players/einar-mordal.webp"

  // Squad players get the minicard for their rating tier. Icons keep their
  // own card, since there are no mini versions of the icon cards.
  const useMiniCard = !player.is_icon
  const miniCardName = formatShortPlayerName(player.name, player.nickname)
  const cardTheme = getCardTheme(getPlayerCardImage(player))

  return (
    <>
      {useMiniCard ? (
        <div className="group relative w-28 h-36 flex justify-center pointer-events-none hover:z-30">
          {/* Box matches the card art's aspect ratio so the overlays line up with it. */}
          <div className="relative h-full aspect-[1288/1800]">
            {/* Only the visible art takes hover/clicks, not the image's transparent margins,
                so overlapping neighbours don't steal the hover. It never scales, so the
                enlarged card can't steal hover from a neighbour either. */}
            <div
              className="absolute top-[13.2%] bottom-[7.5%] inset-x-[9.6%] z-20 cursor-pointer pointer-events-auto"
              onClick={() => setIsDialogOpen(true)}
            />
            {/* Card art and overlays scale up together on hover, like on the Players page. */}
            <div className="absolute inset-0 transition-transform duration-300 group-hover:scale-110">
              <img
                src={getMiniCardForRating(player.rating)}
                alt={player.name}
                className="absolute inset-0 w-full h-full object-contain"
              />
              {showMainAttributes && (
                <>
                  <div className="absolute top-[19%] left-[14%] font-bold text-sm leading-none z-10" style={{ color: MINI_CARD_TEXT }}>
                    {player.rating}
                  </div>
                  <div className="absolute top-[29%] left-[14%] font-bold text-[0.5rem] leading-none z-10" style={{ color: MINI_CARD_TEXT }}>
                    {player.position.toUpperCase()}
                  </div>
                </>
              )}
              {/* Centred in the band below the crests, before the card tapers to its point. */}
              <div
                className="absolute top-[84%] inset-x-[14%] -translate-y-1/2 truncate text-center font-bold text-[0.55rem] leading-none z-10"
                style={{ color: MINI_CARD_TEXT }}
              >
                {miniCardName}
              </div>
              {/* Nationality flag, left of the league crest (same spot as on unknown-player.webp). */}
              {player.nationality && (
                <img
                  src={getFlagUrl(getCountryCode(player.nationality), 64)}
                  alt={`${player.nationality} flag`}
                  className="absolute top-[74.8%] left-[20.2%] w-[17.7%] h-auto -translate-y-1/2 z-10"
                />
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="group relative w-28 h-36 pointer-events-none hover:z-30">
          {/* Card art and overlays scale up together on hover; the hit area below doesn't. */}
          <div className="absolute inset-0 transition-transform duration-300 group-hover:scale-110">
            <img
              src={fifaCardSrc}
              alt={player.name}
              className="w-full h-full object-contain"
            />
            {showMainAttributes && (
              <>
                {/* Player Rating */}
                <div
                  className="absolute top-[18%] left-[16%] font-bold text-sm z-10"
                  style={{
                    color: "#000000",
                    textShadow: "0 0 5px rgba(0,0,0,0.2)",
                  }}
                >
                  {player.rating}
                </div>
                {/* Player Position */}
                <div
                  className="absolute top-[28%] left-[23%] font-bold text-[0.5rem] z-10 transform -translate-x-1/2 text-center"
                  style={{
                    color: "#000000",
                    textShadow: "0 0 5px rgba(0,0,0,0.2)",
                  }}
                >
                  {player.position.toUpperCase()}
                </div>
                {/* Special display for GK */}
                {player.position.toUpperCase() === "GK" && (
                  <div
                    className="absolute top-[55%] left-[10%] text-[0.6rem] z-10"
                    style={{
                      color: "#000000",
                      textShadow: "0 0 5px rgba(0,0,0,0.2)",
                    }}
                  >
                    1
                  </div>
                )}
              </>
            )}
          </div>

          {/* Hit area over the visible art only (icon card art is wider than the minicards'). */}
          <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 aspect-[1288/1800]">
            <div
              className="absolute top-[10.6%] bottom-[7.5%] inset-x-[5.7%] z-20 cursor-pointer pointer-events-auto"
              onClick={() => setIsDialogOpen(true)}
            />
          </div>
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        {/* Same width as the Players page dialog; no padding here since the stats inside pad themselves */}
        <DialogContent className={`max-w-4xl p-0 ${CARD_THEME_DIALOG_CLASS}`} style={cardThemeDialogStyle(cardTheme)}>
          <CardThemeShine theme={cardTheme} />
          <PlayerCardDetailedStats player={player} badgeStyle={{ ...cardTheme.badge, borderColor: cardTheme.border }} />
        </DialogContent>
      </Dialog>
    </>
  )
}
