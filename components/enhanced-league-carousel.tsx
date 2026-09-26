"use client"

import { useState, useRef } from "react"
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
  const carouselRef = useRef<HTMLDivElement>(null)

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
  const { onTouchStart, onTouchMove, onTouchEnd } = useSwipe({
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
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Mobile swipe instruction */}
      <div className="md:hidden text-center text-sm text-gray-500 mb-2">Swipe to see other leagues</div>

      <div className="flex justify-between items-center mb-4">
        <div>
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

      <div className="overflow-hidden">
        <div className="transition-transform duration-300 ease-in-out">
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
              className={`w-2 h-2 rounded-full ${index === activeIndex ? "bg-black" : "bg-gray-300"}`}
              aria-label={`Go to league ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
