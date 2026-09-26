"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Calendar, MapPin, Clock, ChevronRight } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { getUpcomingMatches } from "@/actions/get-league-data"
import { getDominantColor } from "@/utils/dominant-color"
import { TeamGrungeBackdrop } from "@/components/team-grunge-backdrop"

interface UpcomingMatchProps {
  leagueId?: number
  teamId?: number
}

// The team's crest in the database was switched to a round version that
// reads better small (admin UI, league tables), but the original badge
// still looks best at the larger size used here.
const OUR_TEAM_LOGO = "/logos/club/htm-logo-official.png"

export function UpcomingMatch({ leagueId, teamId = 1 }: UpcomingMatchProps) {
  const [nextMatch, setNextMatch] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [homeColor, setHomeColor] = useState("#9CA3AF")
  const [awayColor, setAwayColor] = useState("#9CA3AF")

  useEffect(() => {
    async function fetchUpcomingMatch() {
      try {
        const matches = await getUpcomingMatches(leagueId, 1, teamId)

        if (matches && matches.length > 0) {
          setNextMatch(matches[0])
        }
      } catch (error) {
        console.error("Error fetching upcoming match:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchUpcomingMatch()
  }, [leagueId, teamId])

  useEffect(() => {
    if (!nextMatch) return
    let cancelled = false

    const isHomeUs = nextMatch.homeTeamId === teamId
    const isAwayUs = nextMatch.awayTeamId === teamId

    if (isHomeUs) {
      setHomeColor("#FFFFFF")
    } else if (nextMatch.homeTeamLogo) {
      getDominantColor(nextMatch.homeTeamLogo).then((color) => {
        if (!cancelled) setHomeColor(color)
      })
    }

    if (isAwayUs) {
      setAwayColor("#FFFFFF")
    } else if (nextMatch.awayTeamLogo) {
      getDominantColor(nextMatch.awayTeamLogo).then((color) => {
        if (!cancelled) setAwayColor(color)
      })
    }

    return () => {
      cancelled = true
    }
  }, [nextMatch, teamId])

  if (loading) {
    return (
      <Card className="w-full mx-auto">
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-8 bg-gray-200 rounded mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!nextMatch) {
    return (
      <Card className="w-full mx-auto">
        <CardContent className="p-6 text-center">
          <p className="text-gray-500">No upcoming matches scheduled</p>
        </CardContent>
      </Card>
    )
  }

  const matchDate = new Date(nextMatch.date)
  const formattedDate = matchDate.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  })

  // Encode the location for a valid URL
  const encodedLocation = encodeURIComponent(nextMatch.location)
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedLocation}`

  const isHomeUs = nextMatch.homeTeamId === teamId
  const isAwayUs = nextMatch.awayTeamId === teamId
  const homeLogoSrc = isHomeUs ? OUR_TEAM_LOGO : nextMatch.homeTeamLogo
  const awayLogoSrc = isAwayUs ? OUR_TEAM_LOGO : nextMatch.awayTeamLogo

  return (
    <Card className="group w-full mx-auto relative overflow-hidden bg-gradient-to-r from-black to-gray-800 text-white">
      {/* Whole card links to the lineup; sits under the maps link (a link can't be nested in a link) */}
      <Link
        href={`/lineup?match=${nextMatch.id}`}
        aria-label={`View lineup for ${nextMatch.homeTeam} vs ${nextMatch.awayTeam}`}
        className="absolute inset-0 z-10"
      />
      <div
        className="absolute inset-0 opacity-15"
        style={{
          backgroundImage: "url('/images/backgrounds/empty-stadium.webp')",
          backgroundSize: "120% auto",
          backgroundPosition: "72% center",
          backgroundRepeat: "no-repeat",
        }}
      />
      <CardContent className="relative p-4 sm:p-6">
        <div className="text-center mb-4">
          <h3 className="text-base sm:text-lg font-bold text-gray-300 mb-6">NEXT OPPONENT</h3>

          <div className="flex flex-col items-center gap-4 mb-8 md:flex-row md:justify-center md:gap-0">
            <div className="flex flex-col items-center md:mx-4 md:flex-1">
              <div className="relative w-[110px] h-[110px] sm:w-[140px] sm:h-[140px] md:w-[200px] md:h-[200px] flex items-center justify-center mb-2">
                <TeamGrungeBackdrop
                  color={homeColor}
                  className="absolute left-1/2 top-1/2 w-[190px] sm:w-[240px] md:w-[320px] -translate-x-1/2 -translate-y-1/2 aspect-[1695/928]"
                />
                {homeLogoSrc ? (
                  <img
                    src={homeLogoSrc || "/placeholder.svg"}
                    alt={nextMatch.homeTeam}
                    className="relative w-[86px] h-[86px] sm:w-[110px] sm:h-[110px] md:w-[156px] md:h-[156px] object-contain"
                  />
                ) : (
                  <div className="relative w-[86px] h-[86px] sm:w-[110px] sm:h-[110px] md:w-[156px] md:h-[156px] bg-gray-600 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold">{nextMatch.homeTeam.substring(0, 3).toUpperCase()}</span>
                  </div>
                )}
              </div>
              <span className="text-sm sm:text-base font-medium text-center mt-2">{nextMatch.homeTeam}</span>
              <div className="mt-2 h-[3px] w-14 rounded-full" style={{ backgroundColor: homeColor }} />
            </div>

            <div className="flex items-center justify-center gap-6 sm:gap-10 md:gap-14 md:mx-8">
              <div
                className="w-[2px] h-[60px] sm:h-[90px] md:w-[3px] md:h-[130px]"
                style={{
                  background: `linear-gradient(to bottom, transparent, ${homeColor} 50%, transparent)`,
                  transform: "rotate(30deg)",
                }}
              />
              <div className="text-[40px] sm:text-[56px] md:text-[81px] font-bold text-white leading-none">VS</div>
              <div
                className="w-[2px] h-[60px] sm:h-[90px] md:w-[3px] md:h-[130px]"
                style={{
                  background: `linear-gradient(to bottom, transparent, ${awayColor} 50%, transparent)`,
                  transform: "rotate(30deg)",
                }}
              />
            </div>

            <div className="flex flex-col items-center md:mx-4 md:flex-1">
              <div className="relative w-[110px] h-[110px] sm:w-[140px] sm:h-[140px] md:w-[200px] md:h-[200px] flex items-center justify-center mb-2">
                <TeamGrungeBackdrop
                  color={awayColor}
                  flip
                  className="absolute left-1/2 top-1/2 w-[190px] sm:w-[240px] md:w-[320px] -translate-x-1/2 -translate-y-1/2 aspect-[1695/928]"
                />
                {awayLogoSrc ? (
                  <img
                    src={awayLogoSrc || "/placeholder.svg"}
                    alt={nextMatch.awayTeam}
                    className="relative w-[86px] h-[86px] sm:w-[110px] sm:h-[110px] md:w-[156px] md:h-[156px] object-contain"
                  />
                ) : (
                  <div className="relative w-[86px] h-[86px] sm:w-[110px] sm:h-[110px] md:w-[156px] md:h-[156px] bg-gray-600 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold">{nextMatch.awayTeam.substring(0, 3).toUpperCase()}</span>
                  </div>
                )}
              </div>
              <span className="text-sm sm:text-base font-medium text-center mt-2">{nextMatch.awayTeam}</span>
              <div className="mt-2 h-[3px] w-14 rounded-full" style={{ backgroundColor: awayColor }} />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-center gap-3 text-sm sm:text-base font-medium text-white">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>{formattedDate}</span>
              </div>
              <div className="h-4 w-[2px] bg-white/40" />
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>{nextMatch.time}</span>
              </div>
            </div>

            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="relative z-20 mx-auto flex w-fit items-center justify-center gap-2 text-xs sm:text-sm text-gray-400 transition-colors duration-200 hover:font-bold hover:text-gray-300"
            >
              <MapPin className="w-4 h-4" />
              <span>{nextMatch.location}</span>
            </a>

            {/* Raised above the card link so hovering the text itself underlines it */}
            <div className="pt-2">
              <Link
                href={`/lineup?match=${nextMatch.id}`}
                className="relative z-20 mx-auto flex w-fit items-center justify-center gap-1 text-xs sm:text-sm font-medium text-[#D4AF37] underline-offset-4 transition-opacity group-hover:opacity-70 hover:underline"
              >
                <span>View lineup</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
