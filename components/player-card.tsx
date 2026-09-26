"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { formatPlayerName } from "@/utils/format-player-name"
import { getFifaCardForRating } from "@/utils/fifa-card"
import type { PlayerWithStats } from "@/types/supabase"
import { getFlagUrl } from "@/utils/flag-url"
import { getCountryCode } from "@/utils/country-code"
import { PlayerCardDetailedStats } from "@/components/player-card-detailed-stats"
import { getCardTheme, cardThemeDialogStyle, CardThemeShine, CARD_THEME_DIALOG_CLASS } from "@/components/card-theme-backdrop"

interface PlayerCardProps {
  player: PlayerWithStats
  showDetails?: boolean
}

// Icon card designs. The card images only have the club crest printed on
// them; the Icons league logo is placed beside it at `leagueLogoLeft`.
// Cards that already print a league logo leave `leagueLogoLeft` out.
// `artInset` is where the visible card sits inside its transparent padding;
// cards that leave it out use CARD_ART_INSET.
interface IconCard {
  image: string
  textColor: string
  // Rating and position colour, for cards whose top corner is dark (defaults to textColor).
  topTextColor?: string
  // The art already has the position printed on it, so the site doesn't draw its own.
  hidePosition?: boolean
  // Stat number colour (defaults to textColor).
  statTextColor?: string
  // Centres of the printed PAC..PHY labels, as % of the card width, for art whose labels
  // don't sit where the standard cards have them. The numbers are centred under these.
  statCentres?: number[]
  leagueLogoLeft?: string
  // Where the flag sits, for art whose printed club crest isn't in the usual spot (default 35%).
  flagLeft?: string
  artInset?: string
}

// Visible card art inside the image's transparent padding (top, sides, bottom).
// Only this area reacts to hover and clicks, so the padding, which overlaps
// the neighbouring card in the grid, can't trigger it.
const CARD_ART_INSET = "12% 9.5% 7.6%"
const MARBLE_ART_INSET = "10.4% 5.4% 7.6%"

const MARBLE_TEXT = "rgba(88,78,45,255)"
const BABY_ICON: IconCard = { image: "/images/cards/icons/baby.webp", textColor: MARBLE_TEXT, leagueLogoLeft: "44.25%", artInset: MARBLE_ART_INSET }
const INVINCIBLES: IconCard = { image: "/images/cards/icons/invincibles.webp", textColor: MARBLE_TEXT, leagueLogoLeft: "44.25%", artInset: MARBLE_ART_INSET }
// This art has "CDM" printed on it (Steffen-Even's position), so the site's position is hidden.
const COLD_ICON: IconCard = { image: "/images/cards/icons/ice-cold.webp", textColor: MARBLE_TEXT, leagueLogoLeft: "44.25%", artInset: MARBLE_ART_INSET, hidePosition: true }
// Regular bronze card for an icon; it already has its league logo.
const NON_RARE_BRONZE: IconCard = { image: "/images/cards/templates/non-rare-bronze.webp", textColor: "#2D2410" }
// Cards whose printed club crest sits further right (62.1% across instead of 56.5%): the flag
// and league logo move right too, so the three sit evenly spaced (~9.4% apart).
const FLAG_LEFT_WIDE_CREST = "39.6%"
const LEAGUE_LEFT_WIDE_CREST = "48.85%"
// Its crest is in the same spot as on the champions card.
const FOUNDING_FATHERS: IconCard = {
  image: "/images/cards/icons/founding-fathers.webp",
  textColor: "#1F0854",
  flagLeft: FLAG_LEFT_WIDE_CREST,
  leagueLogoLeft: LEAGUE_LEFT_WIDE_CREST,
}
// Marble with a holographic burst behind the player, same layout as the other marble cards.
const MID_ICON: IconCard = { image: "/images/cards/icons/mid.webp", textColor: MARBLE_TEXT, leagueLogoLeft: "44.25%", artInset: MARBLE_ART_INSET }
// Konrad at Solsiden in the evening. The art was placed on the standard 1288x1800 canvas,
// given the club crest, and faded to white behind the name like the other cards.
const SOLSIDEN: IconCard = {
  image: "/images/cards/icons/solsiden.webp",
  textColor: MARBLE_TEXT,
  // Rating/position in the warm yellow of the fairy lights, over the dark evening sky;
  // darker stats on the pale ice.
  topTextColor: "#FFD36B",
  statTextColor: "#1F1A10",
  statCentres: [20.7, 32.9, 45.1, 56.8, 68.6, 80.6],
  leagueLogoLeft: "44.25%",
  artInset: "10.3% 6.3% 7.4%",
}
// Marble with gold trim; its visible art is a touch wider than the other marble cards.
const CHAMPIONS: IconCard = {
  image: "/images/cards/icons/champions.webp",
  textColor: MARBLE_TEXT,
  flagLeft: FLAG_LEFT_WIDE_CREST,
  leagueLogoLeft: LEAGUE_LEFT_WIDE_CREST,
  artInset: "10.4% 4.5% 7.6%",
}

// Icons with their own special card, by player id. Every other icon gets
// the baby icon card.
const SPECIAL_ICON_CARDS: Record<number, IconCard> = {
  2: INVINCIBLES, // Erik Lyslo
  12: INVINCIBLES, // Einar Grilstad
  17: COLD_ICON, // Steffen-Even Skomedal
  9: SOLSIDEN, // Konrad Mykkeltvedt
  21: NON_RARE_BRONZE, // Martin Mæle
  6: FOUNDING_FATHERS, // Ulrik Lullau
  11: FOUNDING_FATHERS, // Eirik Gløersen
  49: FOUNDING_FATHERS, // Leander Eiring
  53: FOUNDING_FATHERS, // Erik Fuglum
  14: CHAMPIONS, // Sigmund 'Siggi' Berge
  28: CHAMPIONS, // Sigmund Graff
  52: CHAMPIONS, // Elias Bostrom
  51: CHAMPIONS, // Thomas Fahy Instanes
  55: CHAMPIONS, // Bendik Ildstad
  24: CHAMPIONS, // Baste Solberg
  56: CHAMPIONS, // Henrik Bang Olsen
  5: MID_ICON, // Aleksander 'Sten' Halstensen
  4: MID_ICON, // Lars Hermansen
  3: MID_ICON, // Tord Espeset
  8: MID_ICON, // Wilhelm Løken
  50: MID_ICON, // Haakon 'Heiken' IL Lunde
}

// Icons get their special card or the baby icon card; the current squad
// gets a card by rating.
function getIconCard(player: PlayerWithStats) {
  return player.is_icon ? SPECIAL_ICON_CARDS[player.id] ?? BABY_ICON : null
}

/** The card art a player is shown with, e.g. "/images/cards/templates/rare-gold.webp". */
export function getPlayerCardImage(player: PlayerWithStats) {
  const iconCard = getIconCard(player)
  return iconCard ? iconCard.image : getFifaCardForRating(player.rating)
}

export function PlayerCard({ player, showDetails = true }: PlayerCardProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  // Format player name with nickname if available
  const displayName = player.nickname ? formatPlayerName(player.name, player.nickname) : player.name

  // Only show detailed stats if explicitly requested
  const handleCardClick = () => {
    if (showDetails) {
      setIsDialogOpen(true)
    }
  }

  const iconCard = getIconCard(player)
  const fifaCardSrc = getPlayerCardImage(player)
  const cardTheme = getCardTheme(fifaCardSrc)
  // Non-icon text matches the dark brown used on einar-mordal.webp.
  const cardTextColor = iconCard ? iconCard.textColor : "#2D2410"
  const topTextColor = iconCard?.topTextColor ?? cardTextColor
  // Position of stat number i: centred under its printed label when the card says where
  // those are, otherwise the standard left offsets (nudged for single digits).
  const statStyle = (i: number, value: number, left: string, leftSingleDigit: string) => ({
    color: iconCard?.statTextColor ?? cardTextColor,
    ...(iconCard?.statCentres
      ? { left: `${iconCard.statCentres[i]}%`, transform: "translateX(-50%)" }
      : { left: value < 10 ? leftSingleDigit : left }),
  })

  return (
    <>
      {/* Only the hit area below reacts to the pointer: it covers the visible card art and
          never scales, so neither the transparent padding nor the enlarged card can steal
          hover from a neighbour. The inner layer scales the whole card (art plus rating,
          name and stats overlays). */}
      <div
        className="group pointer-events-none relative w-80 aspect-[768/1073] hover:z-10"
        onClick={handleCardClick}
      >
        <div className="pointer-events-none absolute inset-0 transition-transform duration-300 group-hover:scale-110">
          <img
            src={fifaCardSrc || "/placeholder.svg"}
            alt="FIFA card background"
            className="absolute inset-0 w-full h-full object-cover"
          />

          {/* Player Rating */}
          <div
            className="absolute top-[21%] left-[14%] font-bold text-4xl z-10"
            style={{
              color: topTextColor,
              textShadow: iconCard?.topTextColor ? "0 1px 4px rgba(0,0,0,0.6)" : "0 0 5px rgba(0,0,0,0.2)",
            }}
          >
            {player.rating}
          </div>

          {/* Player Position */}
          <div
            className={`absolute top-[30%] left-[21%] font-bold text-2x1 z-10 transform -translate-x-1/2 text-center ${iconCard?.hidePosition ? "hidden" : ""}`}
            style={{
              color: topTextColor,
              textShadow: iconCard?.topTextColor ? "0 1px 4px rgba(0,0,0,0.6)" : "0 0 5px rgba(0,0,0,0.2)",
            }}
          >
            {player.position.toUpperCase()}
          </div>

          {/* Player Nationality Flag */}
          {player.nationality && (
            <div className="absolute top-[82%] z-10" style={{ left: iconCard?.flagLeft ?? "35%" }}>
              <img
                src={getFlagUrl(getCountryCode(player.nationality), 16)}
                alt={`${player.nationality} flag`}
                className="w-6 h-6 rounded object-contain"
              />
            </div>
          )}

          {/* Icon cards only have the club crest printed on them, so add the
              Icons league logo beside it. */}
          {iconCard?.leagueLogoLeft && (
            <img
              src="/images/cards/icons/icons-league-logo.webp"
              alt="Icons league logo"
              className="absolute top-[81.5%] w-6 h-6 object-contain z-10"
              style={{ left: iconCard.leagueLogoLeft }}
            />
          )}

          {/* Player Stats */}
          <div
            className="absolute bottom-[19%] text-[1rem] font-bold z-10"
            style={statStyle(0, player.stats.pace, "16%", "17.5%")}
          >
            {player.stats.pace}
          </div>

          <div
            className="absolute bottom-[19%] text-[1rem] font-bold z-10"
            style={statStyle(1, player.stats.shooting, "28%", "30%")}
          >
            {player.stats.shooting}
          </div>

          <div
            className="absolute bottom-[19%] text-[1rem] font-bold z-10"
            style={statStyle(2, player.stats.passing, "40.5%", "42.5%")}
          >
            {player.stats.passing}
          </div>

          <div
            className="absolute bottom-[19%] text-[1rem] font-bold z-10"
            style={statStyle(3, player.stats.dribbling, "53%", "55%")}
          >
            {player.stats.dribbling}
          </div>

          <div
            className="absolute bottom-[19%] text-[1rem] font-bold z-10"
            style={statStyle(4, player.stats.defending, "65%", "67%")}
          >
            {player.stats.defending}
          </div>

          <div
            className="absolute bottom-[19%] text-[1rem] font-bold z-10"
            style={statStyle(5, player.stats.physical, "77%", "79%")}
          >
            {player.stats.physical}
          </div>

          {/* Player Name */}
          <div
            className="absolute bottom-[30%] left-1/2 transform -translate-x-1/2 text-l font-black text-center w-full z-10"
            style={{ color: cardTextColor, fontWeight: "700" }}
          >
            {displayName}
          </div>
        </div>

        <div
          className="pointer-events-auto absolute cursor-pointer"
          style={{ inset: iconCard?.artInset ?? CARD_ART_INSET }}
        />
      </div>

      {/* Detailed Stats Dialog - Only shown when showDetails is true and dialog is opened */}
      {showDetails && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent
            className={`max-w-4xl p-0 ${CARD_THEME_DIALOG_CLASS}`}
            style={cardThemeDialogStyle(cardTheme)}
          >
            <CardThemeShine theme={cardTheme} />
            <DialogHeader>
              <DialogTitle className="sr-only">Player Details</DialogTitle>
            </DialogHeader>

            <PlayerCardDetailedStats
              player={player}
              badgeStyle={{ ...cardTheme.badge, borderColor: cardTheme.border }}
              photoSrc={player.image_url || "/images/players/messi.jpg"}
            />
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}
