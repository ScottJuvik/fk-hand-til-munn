"use client"

import { useState, useRef, useCallback } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import type { TeamStanding, MatchData } from "@/actions/get-league-data"
import { EnhancedLeagueTable } from "./enhanced-league-table"
import { useSwipe } from "@/hooks/use-swipe"
import type { TeamStats } from "@/actions/get-team-statistics"
import { calculateCleanSheets } from "@/utils/calculate-clean-sheets"

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
  // Which way the last switch went (1 = next, -1 = previous), so the new table
  // slides in from that side.
  const [direction, setDirection] = useState<1 | -1>(1)
  const carouselRef = useRef<HTMLDivElement>(null)

  // Leagues have different numbers of teams; animate the box's height between
  // them instead of letting the page below jump.
  // A callback ref, because the table is remounted on every switch and each new
  // one needs watching.
  const [contentHeight, setContentHeight] = useState<number>()
  const resizeObserver = useRef<ResizeObserver | null>(null)
  const measureContent = useCallback((el: HTMLDivElement | null) => {
    resizeObserver.current?.disconnect()
    if (!el) return
    // Measure right away (the new table's height is the transition's target),
    // then keep following it, e.g. when logos load or the window resizes.
    setContentHeight(el.offsetHeight)
    resizeObserver.current = new ResizeObserver(() => setContentHeight(el.offsetHeight))
    resizeObserver.current.observe(el)
  }, [])

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
    if (newIndex === activeIndex) return
    setDirection(newIndex > activeIndex ? 1 : -1)
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

      <div className="flex justify-between items-center mb-4">
        <div key={activeIndex} className="motion-safe:animate-in fade-in slide-in-from-bottom-2 duration-300">
          <h2 className="text-2xl font-bold">{filteredLeagues[activeIndex].name}</h2>
<p className="text-gray-600">
  {filteredLeagues[activeIndex].season} - {
    activeIndex === 1 || activeIndex === 3 
      ? 2025 
      : activeIndex === 2 
        ? 2024 
        : new Date().getFullYear()
  }
</p>
        </div>
        <div className="flex space-x-2">
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
      </div>

      <div
        className="overflow-hidden transition-[height] duration-500 ease-out motion-reduce:transition-none"
        style={{ height: contentHeight }}
      >
        {/* Remounted per league (key) so the slide-in plays on every switch. */}
        <div
          ref={measureContent}
          key={activeIndex}
          className={`motion-safe:animate-in fade-in duration-500 ease-out ${
            direction === 1 ? "slide-in-from-right-16" : "slide-in-from-left-16"
          }`}
        >
          <EnhancedLeagueTable
            standings={filteredLeagues[activeIndex].standings}
            ourTeam={ourTeam}
            leagueName={filteredLeagues[activeIndex].name}
          />
        </div>
      </div>

      {/* Indicator dots */}
      {filteredLeagues.length > 1 && (
        <div className="flex justify-center mt-4 space-x-2">
          {filteredLeagues.map((_, index) => (
            <button
              key={index}
              onClick={() => changeActiveIndex(index)}
              className={`h-2 rounded-full transition-all duration-300 ${index === activeIndex ? "w-6 bg-black" : "w-2 bg-gray-300 hover:bg-gray-400"}`}
              aria-label={`Go to league ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
