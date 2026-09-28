"use client"

import { useState, useRef, useCallback } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import type { TeamStanding, MatchData } from "@/actions/get-league-data"
import { EnhancedLeagueTable } from "./enhanced-league-table"
import { useSwipe } from "@/hooks/use-swipe"
import type { TeamStats } from "@/actions/get-team-statistics"
import { calculateCleanSheets } from "@/utils/calculate-clean-sheets"

// Extras for a league's table, by league id: a note underneath, and whether its
// winner is marked as champions.
const LEAGUE_EXTRAS: Record<number, { note?: string; champions?: boolean }> = {
  1: {
    note: "* FK Hånd til Munn became champions after winning the head-to-head (innbyrdes oppgjør) against Omega FK 3–2.",
    champions: true,
  },
}

interface EnhancedLeagueCarouselProps {
  leagues: {
    name: string
    standings: TeamStanding[]
    matches?: MatchData[]
    season?: string
    id?: number
  }[]
  ourTeam?: string
  onLeagueChange?: (leagueName: string, teamStats: TeamStats | null, leagueData?: any) => void
}

export function EnhancedLeagueCarousel({ leagues, ourTeam, onLeagueChange }: EnhancedLeagueCarouselProps) {
  // Filter out leagues with no standings
  const filteredLeagues = leagues.filter((league) => league.standings && league.standings.length > 0)

  const [activeIndex, setActiveIndex] = useState(0)
  const carouselRef = useRef<HTMLDivElement>(null)

  // The slider is as tall as the league on screen; leagues have different
  // numbers of teams, so the height eases along with the slide. Measured via
  // a callback ref on the active panel (it moves to the new panel on a switch).
  const [panelHeight, setPanelHeight] = useState<number>()
  const resizeObserver = useRef<ResizeObserver | null>(null)
  const measureActivePanel = useCallback((el: HTMLDivElement | null) => {
    resizeObserver.current?.disconnect()
    if (!el) return
    setPanelHeight(el.offsetHeight)
    resizeObserver.current = new ResizeObserver(() => setPanelHeight(el.offsetHeight))
    resizeObserver.current.observe(el)
  }, [])

  // Season year shown under each league's name, by position in the carousel
  // (current season, Avdeling B, C-sluttspill, Avdeling A).
  const SEASON_YEARS = [new Date().getFullYear(), 2025, 2024, 2023]
  const seasonYear = (index: number) => SEASON_YEARS[index] ?? new Date().getFullYear()

  // Helper function to get team stats for a league
  const getTeamStatsForLeague = (leagueIndex: number) => {
    if (filteredLeagues.length === 0 || leagueIndex >= filteredLeagues.length) return null

    const league = filteredLeagues[leagueIndex]
    const ourTeamData = league.standings.find(
      (team) => team.teamName === ourTeam || team.teamName.includes("FK Hånd til Munn"),
    )

    if (!ourTeamData) return null

    return {
      matchesPlayed: ourTeamData.played,
      wins: ourTeamData.won,
      draws: ourTeamData.drawn,
      losses: ourTeamData.lost,
      goalsScored: ourTeamData.goalsFor,
      goalsConceded: ourTeamData.goalsAgainst,
      cleanSheets: calculateCleanSheets(league.matches, ourTeamData.teamId),
      goalDifference: ourTeamData.goalDifference,
    }
  }

  // Handle user-triggered index changes
  const changeActiveIndex = (newIndex: number) => {
    setActiveIndex(newIndex)

    // Only call onLeagueChange when user explicitly changes the index
    if (onLeagueChange && filteredLeagues.length > 0 && newIndex < filteredLeagues.length) {
      const league = filteredLeagues[newIndex]
      const teamStats = getTeamStatsForLeague(newIndex)
      onLeagueChange(league.name, teamStats, league)
    }
  }

  // Handle swipe gestures
  const { handleTouchStart, handleTouchMove, handleTouchEnd } = useSwipe({
    onSwipeLeft: () => {
      if (activeIndex < filteredLeagues.length - 1) {
        changeActiveIndex(activeIndex + 1)
      }
    },
    onSwipeRight: () => {
      if (activeIndex > 0) {
        changeActiveIndex(activeIndex - 1)
      }
    },
  })

  const goToPrevious = () => {
    if (activeIndex > 0) {
      changeActiveIndex(activeIndex - 1)
    }
  }

  const goToNext = () => {
    if (activeIndex < filteredLeagues.length - 1) {
      changeActiveIndex(activeIndex + 1)
    }
  }

  // Call onLeagueChange once on initial render
  // This is done with a ref to ensure it only happens once
  const initializedRef = useRef(false)
  if (!initializedRef.current && filteredLeagues.length > 0 && onLeagueChange) {
    initializedRef.current = true
    const league = filteredLeagues[0]
    const teamStats = getTeamStatsForLeague(0)
    // We're not in a render cycle here, so this is safe
    setTimeout(() => {
      onLeagueChange(league.name, teamStats, league)
    }, 0)
  }

  if (filteredLeagues.length === 0) {
    return <div className="text-center p-4">No league data available</div>
  }

  return (
    <div
      className="relative"
      ref={carouselRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Mobile swipe instruction */}
      <div className="md:hidden text-center text-sm text-gray-500 mb-2">Swipe to see other leagues</div>

      <div className="relative">
        {/* Arrows stay put (level with the league name) while the leagues slide underneath them. */}
        <div className="absolute right-0 top-2.5 z-10 flex space-x-2">
          <button
            onClick={goToPrevious}
            disabled={activeIndex === 0}
            className="p-2 rounded-full bg-gray-100 disabled:opacity-50"
            aria-label="Previous league"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={goToNext}
            disabled={activeIndex === filteredLeagues.length - 1}
            className="p-2 rounded-full bg-gray-100 disabled:opacity-50"
            aria-label="Next league"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Every league sits side by side on a track; switching slides the whole
            league (name, season and table) across, the old one out as the new one comes in. */}
        <div
          className="overflow-hidden transition-[height] duration-500 ease-in-out motion-reduce:transition-none"
          style={{ height: panelHeight }}
        >
          <div
            className="flex items-start transition-transform duration-500 ease-in-out motion-reduce:transition-none"
            style={{ transform: `translateX(-${activeIndex * 100}%)` }}
          >
            {filteredLeagues.map((league, index) => (
              <div
                key={league.id ?? league.name}
                ref={index === activeIndex ? measureActivePanel : undefined}
                className="w-full shrink-0"
                aria-hidden={index !== activeIndex}
                // Off-screen leagues can't be tabbed into. Next 14 renders with its bundled
                // React 18, which only passes `inert` through as a string.
                {...({ inert: index !== activeIndex ? "" : undefined } as object)}
              >
                <div className="mb-4 pr-24">
                  <h2 className="text-2xl font-bold">{league.name}</h2>
                  <p className="text-gray-600">
                    {league.season} - {seasonYear(index)}
                  </p>
                </div>
                <EnhancedLeagueTable
                  standings={league.standings}
                  ourTeam={ourTeam}
                  leagueName={league.name}
                  note={league.id !== undefined ? LEAGUE_EXTRAS[league.id]?.note : undefined}
                  champions={league.id !== undefined && !!LEAGUE_EXTRAS[league.id]?.champions}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Indicator dots */}
      {filteredLeagues.length > 1 && (
        <div className="flex justify-center mt-4 space-x-2">
          {filteredLeagues.map((_, index) => (
            <button
              key={index}
              onClick={() => changeActiveIndex(index)}
              className={`w-2 h-2 rounded-full ${index === activeIndex ? "bg-black" : "bg-gray-300"}`}
              aria-label={`Go to league ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
