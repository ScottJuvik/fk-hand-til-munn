"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FormationView } from "@/components/formation-view"
import { PitchView } from "@/components/pitch-view"
import { getLineup, getLineupForMatch, getLineupPlayers } from "@/actions/public-data"
import type { PlayerWithStats, Lineup } from "@/types/supabase"
import { Loader2, AlertCircle, Database } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { startingPlayers, substitutePlayers } from "@/data/players"
import MatchDetails from "@/components/match-details" // Import the MatchDetails component
import { LoadingSpinner } from "@/components/loading-spinner"
import { LineupMatchHeader, toMatchHeader, type MatchHeader } from "@/components/lineup-match-header"

// Convert hardcoded player data to the format expected by components
const convertHardcodedPlayers = (players: any[]): PlayerWithStats[] => {
  return players.map((player) => ({
    id: player.id,
    name: player.name,
    position: player.position,
    rating: player.rating,
    image_url: player.image || "/placeholder.svg?height=200&width=150",
    nationality: player.nationality || "Norway",
    club: player.club || "FK Hånd til Munn",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    shirt_number: player.shirtNumber || null,
    weak_foot: player.weakFoot || null,
    skill_moves: player.skillMoves || null,
    attacking_work_rate: player.attackingWorkRate || null,
    defensive_work_rate: player.defensiveWorkRate || null,
    nickname: player.nickname || null,
    alternate_positions: player.alternatePositions || null,
    specialties: player.specialties || null,
    stats: {
      pace: player.stats.pace,
      shooting: player.stats.shooting,
      passing: player.stats.passing,
      dribbling: player.stats.dribbling,
      defending: player.stats.defending,
      physical: player.stats.physical,
      acceleration: player.stats.acceleration,
      sprint_speed: player.stats.sprintSpeed,
      positioning: player.stats.positioning,
      finishing: player.stats.finishing,
      shot_power: player.stats.shotPower,
      long_shots: player.stats.longShots,
      vision: player.stats.vision,
      crossing: player.stats.crossing,
      free_kick: player.stats.freeKick,
      short_passing: player.stats.shortPassing,
      long_passing: player.stats.longPassing,
      curve: player.stats.curve,
      agility: player.stats.agility,
      balance: player.stats.balance,
      reactions: player.stats.reactions,
      ball_control: player.stats.ballControl,
      composure: player.stats.composure,
      interceptions: player.stats.interceptions,
      heading_accuracy: player.stats.headingAccuracy,
      marking: player.stats.marking,
      standing_tackle: player.stats.standingTackle,
      sliding_tackle: player.stats.slidingTackle,
      jumping: player.stats.jumping,
      stamina: player.stats.stamina,
      strength: player.stats.strength,
      aggression: player.stats.aggression,
    },
  }))
}

export default function LineupPage() {
  const searchParams = useSearchParams()
  const lineupId = searchParams.get("id")
  const matchId = searchParams.get("match")

  const [formation, setFormation] = useState("4-3-3")
  const [loading, setLoading] = useState(true)
  const [lineup, setLineup] = useState<Lineup | null>(null)
  const [matchHeader, setMatchHeader] = useState<MatchHeader | null>(null)
  const [startingPlayersList, setStartingPlayersList] = useState<PlayerWithStats[]>([])
  const [substitutePlayersList, setSubstitutePlayersList] = useState<PlayerWithStats[]>([])
  const [noDataInDatabase, setNoDataInDatabase] = useState(false)
  const [noActiveLineup, setNoActiveLineup] = useState(false)
  const [seedingDatabase, setSeedingDatabase] = useState(false)

  // Function to seed the database
  const handleSeedDatabase = async () => {
    setSeedingDatabase(true)
    try {
      const response = await fetch("/api/seed")
      const data = await response.json()

      if (data.success) {
        // Reload the page to fetch the new data
        window.location.reload()
      } else {
        console.error("Error seeding database:", data.message)
        alert("Failed to seed database. Please check the console for details.")
      }
    } catch (error) {
      console.error("Error seeding database:", error)
      alert("Failed to seed database. Please check the console for details.")
    } finally {
      setSeedingDatabase(false)
    }
  }

  useEffect(() => {
    async function fetchLineupData() {
      setLoading(true)
      try {
        // Fetch a specific lineup by ID, the active lineup for a match, or the active lineup
        const { data: lineupData, error: lineupError } =
          !lineupId && matchId ? await getLineupForMatch(matchId) : await getLineup(lineupId)

        if (lineupError || (lineupId && !lineupData)) {
          console.error("Error fetching lineup:", lineupError)
          setNoDataInDatabase(true)
          return
        }

        // No fallback to the most recent lineup here: if nothing is
        // marked active, the public page should say so rather than
        // silently showing a lineup that isn't actually active.
        if (!lineupData) {
          setNoActiveLineup(true)
          return
        }

        setLineup(lineupData)
        setFormation(lineupData.formation)

        // Load the match for the header alongside the players, so the page
        // appears in one go instead of the header swapping in afterwards.
        const {
          lineupPlayers,
          players,
          images: playerImages,
          stats: playerStats,
          error: playersError,
          matchHeader,
        } = await getLineupPlayers(lineupData.id, lineupData.match_id)
        setMatchHeader(toMatchHeader(matchHeader))

        if (playersError) {
          console.error("Error fetching lineup players:", playersError)
          setNoDataInDatabase(true)
          return
        }

        // If no players found, use hardcoded data
        if (!lineupPlayers || lineupPlayers.length === 0) {
          console.error("No players found for this lineup")
          setNoDataInDatabase(true)

          // Use hardcoded data as fallback
          setStartingPlayersList(convertHardcodedPlayers(startingPlayers))
          setSubstitutePlayersList(convertHardcodedPlayers(substitutePlayers))
          return
        }

        // A handful of players in the squad don't have a player_stats row
        // yet. Fall back to a neutral default instead of dropping them from
        // the lineup entirely (that was making players silently vanish from
        // the formation view regardless of which position they were in).
        const DEFAULT_STAT = 50
        const defaultStats = {
          pace: DEFAULT_STAT,
          shooting: DEFAULT_STAT,
          passing: DEFAULT_STAT,
          dribbling: DEFAULT_STAT,
          defending: DEFAULT_STAT,
          physical: DEFAULT_STAT,
          acceleration: DEFAULT_STAT,
          sprint_speed: DEFAULT_STAT,
          positioning: DEFAULT_STAT,
          finishing: DEFAULT_STAT,
          shot_power: DEFAULT_STAT,
          long_shots: DEFAULT_STAT,
          vision: DEFAULT_STAT,
          crossing: DEFAULT_STAT,
          free_kick: DEFAULT_STAT,
          short_passing: DEFAULT_STAT,
          long_passing: DEFAULT_STAT,
          curve: DEFAULT_STAT,
          agility: DEFAULT_STAT,
          balance: DEFAULT_STAT,
          reactions: DEFAULT_STAT,
          ball_control: DEFAULT_STAT,
          composure: DEFAULT_STAT,
          interceptions: DEFAULT_STAT,
          heading_accuracy: DEFAULT_STAT,
          marking: DEFAULT_STAT,
          standing_tackle: DEFAULT_STAT,
          sliding_tackle: DEFAULT_STAT,
          jumping: DEFAULT_STAT,
          stamina: DEFAULT_STAT,
          strength: DEFAULT_STAT,
          aggression: DEFAULT_STAT,
        }

        // Combine all the data
        const playersWithStats = lineupPlayers
          .map((lp) => {
            const player = players.find((p) => p.id === lp.player_id)
            const stats = playerStats.find((ps) => ps.player_id === lp.player_id)
            const image = playerImages?.find((pi) => pi.player_id === lp.player_id)

            if (!player) return null

            // Use FIFA card URL if available, otherwise fallback to playercard_url or placeholder
            const imageUrl = image?.fifa_card_url || image?.playercard_url || "/placeholder.svg?height=200&width=150"

            return {
              ...player,
              position: lp.position, // The slot they play in, shown on the card
              natural_position: player.position, // Their own position, used for chemistry
              image_url: imageUrl, // Use FIFA card URL or fallback
              stats: stats
                ? {
                    pace: stats.pace,
                    shooting: stats.shooting,
                    passing: stats.passing,
                    dribbling: stats.dribbling,
                    defending: stats.defending,
                    physical: stats.physical,
                    acceleration: stats.acceleration,
                    sprint_speed: stats.sprint_speed,
                    positioning: stats.positioning,
                    finishing: stats.finishing,
                    shot_power: stats.shot_power,
                    long_shots: stats.long_shots,
                    vision: stats.vision,
                    crossing: stats.crossing,
                    free_kick: stats.free_kick,
                    short_passing: stats.short_passing,
                    long_passing: stats.long_passing,
                    curve: stats.curve,
                    agility: stats.agility,
                    balance: stats.balance,
                    reactions: stats.reactions,
                    ball_control: stats.ball_control,
                    composure: stats.composure,
                    interceptions: stats.interceptions,
                    heading_accuracy: stats.heading_accuracy,
                    marking: stats.marking,
                    standing_tackle: stats.standing_tackle,
                    sliding_tackle: stats.sliding_tackle,
                    jumping: stats.jumping,
                    stamina: stats.stamina,
                    strength: stats.strength,
                    aggression: stats.aggression,
                  }
                : defaultStats,
            }
          })
          .filter(Boolean) as PlayerWithStats[]

        // Split into starting and substitute players
        const starting = playersWithStats.filter((p) =>
          lineupPlayers.find((lp) => lp.player_id === p.id && !lp.is_substitute),
        )

        const substitutes = playersWithStats.filter((p) =>
          lineupPlayers.find((lp) => lp.player_id === p.id && lp.is_substitute),
        )

        setStartingPlayersList(starting)
        setSubstitutePlayersList(substitutes)
      } catch (error) {
        console.error("Error:", error)
        setNoDataInDatabase(true)

        // Use hardcoded data as fallback
        setStartingPlayersList(convertHardcodedPlayers(startingPlayers))
        setSubstitutePlayersList(convertHardcodedPlayers(substitutePlayers))
      } finally {
        setLoading(false)
      }
    }

    fetchLineupData()
  }, [lineupId, matchId])

  if (loading) {
    return <LoadingSpinner label="Loading lineup" />
  }

  if (noActiveLineup && matchId) {
    return (
      <div className="min-h-screen bg-gray-100 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center py-24">
            <h1 className="text-2xl font-bold mb-2">Lineup Not Published Yet</h1>
            <p className="text-gray-600">The lineup for this match has not been published yet. Check back closer to kick-off.</p>
          </div>
          <div className="max-w-6xl mx-auto">
            <MatchDetails matchId={Number(matchId)} />
          </div>
        </div>
      </div>
    )
  }

  if (noActiveLineup) {
    return (
      <div className="min-h-screen bg-gray-100 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center py-24">
            <h1 className="text-2xl font-bold mb-2">No Active Lineup</h1>
            <p className="text-gray-600">Sorry, there are no active lineups at the moment.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {noDataInDatabase && (
            <Alert className="mb-6 bg-amber-50 border-amber-200">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <AlertTitle className="text-amber-800">No lineup data found in database</AlertTitle>
              <AlertDescription className="text-amber-700">
                <p className="mb-2">Using fallback data for display. To populate the database with real data:</p>
                <div className="flex gap-2">
                  <Button
                    onClick={handleSeedDatabase}
                    disabled={seedingDatabase}
                    className="bg-black text-white hover:bg-gray-800"
                  >
                    {seedingDatabase ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Seeding Database...
                      </>
                    ) : (
                      <>
                        <Database className="h-4 w-4 mr-2" />
                        Seed Database
                      </>
                    )}
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}

          <LineupMatchHeader match={matchHeader} fallbackTitle={lineup?.name} fallbackDate={lineup?.match_date} />

          <Tabs defaultValue="pitch" className="mb-12">
            <div className="flex justify-between items-center mb-6">
              <TabsList>
                <TabsTrigger value="pitch">FIFA Style</TabsTrigger>
                <TabsTrigger value="formation">Classic View</TabsTrigger>
              </TabsList>

              {/* Hidden on phones; the formation is already shown on the pitch header. */}
              <div className="hidden md:flex items-center gap-2">
                <span className="text-sm font-medium">Formation:</span>
                <select
                  value={formation}
                  onChange={(e) => setFormation(e.target.value)}
                  className="border rounded px-2 py-1 text-sm"
                  disabled={!noDataInDatabase} // Only enable if using fallback data
                >
                  <option value="4-3-3">4-3-3</option>
                  <option value="4-4-2">4-4-2</option>
                  <option value="3-5-2">3-5-2</option>
                </select>
              </div>
            </div>

            <TabsContent value="pitch">
              <Card className="p-6 bg-gradient-to-b from-green-600 to-green-800">
                <PitchView
                  formation={formation}
                  players={startingPlayersList}
                  substitutes={substitutePlayersList}
                />
              </Card>
            </TabsContent>

            <TabsContent value="formation">
              <Card className="p-6">
                <FormationView
                  formation={formation}
                  players={startingPlayersList}
                  substitutes={substitutePlayersList}
                />
              </Card>
            </TabsContent>
          </Tabs>

          {/* Use the MatchDetails component here */}
          {lineup?.match_id && <MatchDetails matchId={lineup.match_id} />}
          {!lineup?.match_id && lineupId && <MatchDetails lineupId={parseInt(lineupId)} />}
        </div>
      </div>
    </div>
  )
}
