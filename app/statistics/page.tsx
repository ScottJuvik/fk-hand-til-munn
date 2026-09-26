"use client"

import { useState, useEffect } from "react"
import Loading from "./loading"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getLeagueOptions, getLeagueStatistics } from "@/actions/public-data"
import { ArrowUpDown, Crown, Search, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Define the player statistics type
type PlayerStatistics = {
  player_id: number
  goals: number
  assists: number
  matches_played: number
  yellow_cards: number
  red_cards: number
  minutes_played: number
  players: {
    id: number
    name: string
    nickname: string | null
    position: string
    rating: number
    player_images: {
      fifa_card_url: string | null
      playercard_url: string | null
    } | null
  }
}

type League = {
  id: number
  name: string
  season: string
  year: number
}

// Player statistics are tracked from this season onwards. Older seasons show a
// notice instead of their (incomplete) stats.
const FIRST_TRACKED_YEAR = 2026

const TOP_SCORER_ROW_GRADIENT =
  "linear-gradient(90deg, rgba(212,175,55,0.16), rgba(212,175,55,0.05) 65%, transparent 100%)"

type SortKey = keyof PlayerStatistics | "players.name" | "players.position" | "goalsAndAssists"

// Table columns; `short` is the header on phones so the whole row fits.
const COLUMNS: { key: SortKey; label: string; short: string; align: "left" | "center"; hideOnPhone?: boolean }[] = [
  { key: "players.name", label: "Player", short: "Player", align: "left" },
  { key: "players.position", label: "Position", short: "Pos", align: "left" },
  { key: "matches_played", label: "Matches", short: "MP", align: "center", hideOnPhone: true },
  { key: "goals", label: "Goals", short: "G", align: "center" },
  { key: "assists", label: "Assists", short: "A", align: "center" },
  { key: "goalsAndAssists", label: "G+A", short: "G+A", align: "center" },
  { key: "yellow_cards", label: "Yellow", short: "Y", align: "center" },
  { key: "red_cards", label: "Red", short: "R", align: "center" },
  { key: "minutes_played", label: "Minutes", short: "Min", align: "center" },
]

// Cell padding: tight on phones, roomier from sm up.
const CELL = "px-1 py-2 sm:px-4 sm:py-3"
// The player column keeps some space on the left (clear of the top scorer bar).
const PLAYER_CELL = `${CELL} pl-4`

// "Herman Liverud Knudsen" -> "H. Knudsen", for the narrow phone table.
const shortName = (name: string) => {
  const parts = name.trim().split(/\s+/)
  return parts.length < 2 ? name : `${parts[0][0]}. ${parts[parts.length - 1]}`
}

export default function StatisticsPage() {
  const [playerStats, setPlayerStats] = useState<PlayerStatistics[]>([])
  const [leagues, setLeagues] = useState<League[]>([])
  const [selectedLeagueId, setSelectedLeagueId] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortConfig, setSortConfig] = useState<{
    key: SortKey
    direction: "ascending" | "descending"
  }>({
    key: "goals",
    direction: "descending",
  })

  // Fetch all available leagues for the dropdown
  useEffect(() => {
    async function fetchLeagues() {
      try {
        const { data, error } = await getLeagueOptions()

        if (error) throw new Error(error)
        setLeagues(data)
        // Default to the newest league (leagues are ordered by year descending).
        // Selecting it starts the stats fetch, which ends the loading state.
        if (data && data.length > 0) {
          setSelectedLeagueId((current) => current ?? data[0].id)
        } else {
          setLoading(false)
        }
      } catch (err) {
        console.error("Error fetching leagues:", err)
        setLoading(false)
      }
    }
    fetchLeagues()
  }, [])

  // Fetch every current-squad player, then merge in their stats for the
  // selected league (defaulting to zero) so players who haven't scored or
  // picked up a card yet still show up, not just ones with a stats row.
  useEffect(() => {
    async function fetchPlayerStats() {
      // No league yet: keep showing the loading state until the league list
      // arrives, instead of flashing the empty "Select a League" view.
      if (!selectedLeagueId) return

      const league = leagues.find((l) => l.id === selectedLeagueId)
      if (league && league.year < FIRST_TRACKED_YEAR) {
        setPlayerStats([])
        setLoading(false)
        return
      }

      setLoading(true)
      try {
        const { players, stats, error } = await getLeagueStatistics(selectedLeagueId)

        if (error) throw new Error(error)

        const merged: PlayerStatistics[] = (players || []).map((player) => {
          const stat = stats?.find((s) => s.player_id === player.id)
          return {
            player_id: player.id,
            goals: stat?.goals ?? 0,
            assists: stat?.assists ?? 0,
            matches_played: stat?.matches_played ?? 0,
            yellow_cards: stat?.yellow_cards ?? 0,
            red_cards: stat?.red_cards ?? 0,
            minutes_played: stat?.minutes_played ?? 0,
            players: player as unknown as PlayerStatistics["players"],
          }
        })

        setPlayerStats(merged)
      } catch (err) {
        console.error("Error fetching player statistics:", err)
        setError("Failed to load player statistics")
      } finally {
        setLoading(false)
      }
    }
    fetchPlayerStats()
  }, [selectedLeagueId, leagues])

  const leagueInfo = leagues.find((l) => l.id === selectedLeagueId) || null
  const isUntrackedSeason = leagueInfo !== null && leagueInfo.year < FIRST_TRACKED_YEAR

  // Handle sorting
  const requestSort = (key: typeof sortConfig.key) => {
    // A new column starts with the leaders on top: highest first for numbers,
    // A-Z for name and position. Clicking the same column again flips it.
    if (sortConfig.key === key) {
      setSortConfig({ key, direction: sortConfig.direction === "ascending" ? "descending" : "ascending" })
    } else {
      const isText = key === "players.name" || key === "players.position"
      setSortConfig({ key, direction: isText ? "ascending" : "descending" })
    }
  }

  // Get sorted and filtered data
  const getSortedAndFilteredData = () => {
    const filteredData = playerStats.filter((player) => {
      if (!searchTerm) return true

      const searchLower = searchTerm.toLowerCase()
      return (
        player.players.name.toLowerCase().includes(searchLower) ||
        player.players.position.toLowerCase().includes(searchLower) ||
        (player.players.nickname && player.players.nickname.toLowerCase().includes(searchLower))
      )
    })

    return [...filteredData].sort((a, b) => {
      let aValue: any
      let bValue: any

      if (sortConfig.key === "players.name") {
        aValue = a.players.name
        bValue = b.players.name
      } else if (sortConfig.key === "players.position") {
        aValue = a.players.position
        bValue = b.players.position
      } else if (sortConfig.key === "goalsAndAssists") {
        aValue = a.goals + a.assists
        bValue = b.goals + b.assists
      } else {
        aValue = a[sortConfig.key as keyof PlayerStatistics]
        bValue = b[sortConfig.key as keyof PlayerStatistics]
      }

      if (aValue < bValue) return sortConfig.direction === "ascending" ? -1 : 1
      if (aValue > bValue) return sortConfig.direction === "ascending" ? 1 : -1
      return 0
    })
  }

  const sortedAndFilteredData = getSortedAndFilteredData()

  // Most goals in the selected league, from all players (not just search matches).
  // Everyone tied on it gets the top scorer label; nobody does before a goal is scored.
  const topGoals = Math.max(0, ...playerStats.map((p) => p.goals))
  const isTopScorer = (player: PlayerStatistics) => topGoals > 0 && player.goals === topGoals

  const renderSortIndicator = (key: typeof sortConfig.key) => {
    if (sortConfig.key !== key) {
      return <ArrowUpDown className="h-4 w-4 ml-1 opacity-50" />
    }
    return sortConfig.direction === "ascending" ? (
      <ArrowUpDown className="h-4 w-4 ml-1 text-blue-500" />
    ) : (
      <ArrowUpDown className="h-4 w-4 ml-1 text-blue-500 rotate-180" />
    )
  }

  if (loading) {
    return <Loading />
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 py-12">
        <div className="container mx-auto px-4">
          <div className="flex justify-center items-center h-64">
            <div className="text-lg text-red-500">{error}</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <div className="container mx-auto px-4">
        <h1 className="mb-8 text-3xl font-bold">Player Statistics</h1>

        <Card>
<CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
    {/* Search bar (left); invisible for untracked seasons so the title stays centered */}
    <div className={`relative w-full sm:w-64 ${isUntrackedSeason ? "invisible" : ""}`}>
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
        <Input
            placeholder="Search players..."
            className="pl-9 pr-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
        />
        {searchTerm && (
            <button
                onClick={() => setSearchTerm("")}
                className="absolute right-2.5 top-2.5 text-gray-500 hover:text-gray-700"
            >
                <X className="h-4 w-4" />
            </button>
        )}
    </div>

    {/* Centered League Header */}
    <div className="flex-1 flex justify-center items-center">
        <CardTitle>
            {leagueInfo ? `${leagueInfo.name} - ${leagueInfo.year}` : "Select a League"}
        </CardTitle>
    </div>

    <div className="flex items-center gap-4">
        {/* League dropdown (right) */}
        <Select
            value={selectedLeagueId ? String(selectedLeagueId) : ""}
            onValueChange={(value) => setSelectedLeagueId(Number(value))}
        >
            <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select a league" />
            </SelectTrigger>
            <SelectContent>
                {leagues.map((league) => (
                    <SelectItem key={league.id} value={String(league.id)}>
                        {`${league.name} - ${league.year}`}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    </div>
</CardHeader>
          <CardContent className="px-2 sm:px-6">
            {isUntrackedSeason ? (
              <div className="py-16 text-center text-gray-500">
                <p className="text-lg font-medium text-gray-700">No statistics for this season</p>
                <p className="mt-1">We track player statistics from the {FIRST_TRACKED_YEAR} season onwards.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                {/* Separate rows with an 8px gap; each body row is a rounded (12px) pill. */}
                <table className="w-full border-separate border-spacing-x-0 border-spacing-y-1.5 sm:border-spacing-y-2 text-xs sm:text-base">
                  <thead>
                    <tr className="border-b">
                      {COLUMNS.map((col) => (
                        <th
                          key={col.key}
                          className={`${col.key === "players.name" ? PLAYER_CELL : CELL} py-2 sm:py-3 cursor-pointer hover:bg-gray-50 ${col.align === "left" ? "text-left" : "text-center"} ${col.hideOnPhone ? "hidden sm:table-cell" : ""}`}
                          onClick={() => requestSort(col.key)}
                        >
                          <div className={`flex items-center ${col.align === "left" ? "" : "justify-center"}`}>
                            {/* Phones: no arrows (so headers line up with the numbers); the sorted column is blue instead. */}
                            <span className={`sm:hidden ${sortConfig.key === col.key ? "text-blue-500" : ""}`}>{col.short}</span>
                            <span className="hidden sm:inline">{col.label}</span>
                            <span className="hidden sm:inline">{renderSortIndicator(col.key)}</span>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {sortedAndFilteredData.length === 0 ? (
                      <tr>
                        <td colSpan={10} className="px-4 py-8 text-center text-gray-500">
                          {searchTerm ? "No players match your search" : "No player statistics available"}
                        </td>
                      </tr>
                    ) : (
                      sortedAndFilteredData.map((player) => (
                        <tr
                          key={player.player_id}
                          className={
                            isTopScorer(player)
                              ? "group bg-gray-50 [clip-path:inset(0_round_12px)] transition-colors duration-300 hover:bg-[#FBF3DC]"
                              : "bg-gray-50 [clip-path:inset(0_round_12px)] transition-colors duration-200 hover:bg-gray-100"
                          }
                          // Soft gold fading out to the right; the hover colour above layers on top of it.
                          style={isTopScorer(player) ? { backgroundImage: TOP_SCORER_ROW_GRADIENT } : undefined}
                        >
                          <td className={`relative ${PLAYER_CELL}`}>
                            {isTopScorer(player) && (
                              <>
                                {/* Full-height gold bar with a glow fading out to the right. */}
                                <span className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-[#FFD54A] via-[#E5A800] to-[#FFD54A]" />
                                <span className="absolute inset-y-0 left-1 w-5 bg-gradient-to-r from-[rgba(229,168,0,0.28)] to-transparent opacity-80 transition-opacity duration-300 group-hover:opacity-100" />
                              </>
                            )}
                            <div className="flex items-center">
                              <div className="hidden sm:flex w-8 h-8 rounded-full bg-gray-200 items-center justify-center mr-3 flex-shrink-0">
                                {player.players.player_images?.playercard_url ? (
                                  <img
                                    src={player.players.player_images.playercard_url}
                                    alt={player.players.name}
                                    className="w-8 h-8 rounded-full object-cover"
                                  />
                                ) : (
                                  <span className="text-xs">{player.players.position}</span>
                                )}
                              </div>
                              <span className="sm:hidden">{shortName(player.players.name)}</span>
                              <span className="hidden sm:inline">{player.players.name}</span>
                              {isTopScorer(player) && (
                                <span className="ml-1 sm:ml-2 inline-flex items-center gap-1 rounded-full sm:border border-[#E5A800] sm:px-2 py-0.5 text-xs font-bold text-[#E5A800] whitespace-nowrap">
                                  <Crown className="h-3 w-3" fill="currentColor" />
                                  <span className="hidden sm:inline">Top scorer</span>
                                </span>
                              )}
                            </div>
                          </td>
                          <td className={CELL}>{player.players.position}</td>
                          <td className={`${CELL} text-center hidden sm:table-cell`}>{player.matches_played}</td>
                          <td className={`${CELL} text-center font-bold`}>{player.goals}</td>
                          <td className={`${CELL} text-center font-bold`}>{player.assists}</td>
                          <td className={`${CELL} text-center`}>{player.goals + player.assists}</td>
                          <td className={`${CELL} text-center`}>
                            {player.yellow_cards > 0 && (
                              <span className="inline-block bg-yellow-400 text-black font-bold px-1.5 sm:px-2 py-0.5 rounded-full">
                                {player.yellow_cards}
                              </span>
                            )}
                          </td>
                          <td className={`${CELL} text-center`}>
                            {player.red_cards > 0 && (
                              <span className="inline-block bg-red-500 text-white font-bold px-1.5 sm:px-2 py-0.5 rounded-full">
                                {player.red_cards}
                              </span>
                            )}
                          </td>
                          <td className={`${CELL} text-center`}>{player.minutes_played}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
