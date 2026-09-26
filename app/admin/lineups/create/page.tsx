"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { CalendarClock, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import Loading from "./loading"
import { LineupPlayersForm } from "@/components/admin/lineup-players-form"
import { LineupPreviewDialog } from "@/components/admin/lineup-preview-dialog"
import { LocationCombobox } from "@/components/admin/location-combobox"
import { Matchup } from "@/components/admin/matchup"
import { useLocationSuggestions } from "@/hooks/use-location-suggestions"
import { adminGetPlayers } from "@/actions/admin-data"
import { getUpcomingMatches, type MatchData } from "@/actions/get-league-data"
import { FORMATIONS, remapStarters } from "@/utils/formations"
import { useToast } from "@/hooks/use-toast"
import type { Player } from "@/types/supabase"
import { useAuth } from "@/components/auth-provider"
import { AdminPageHeader } from "@/components/admin/admin-page-header"

const OUR_TEAM_ID = 1

export default function CreateLineup() {
  const router = useRouter()
  const { userRole } = useAuth()
  const { toast } = useToast()
  const locationSuggestions = useLocationSuggestions()
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const [matches, setMatches] = useState<MatchData[]>([])
  const [players, setPlayers] = useState<Player[]>([])

  const [selectedMatchId, setSelectedMatchId] = useState<string>("")
  const [matchDate, setMatchDate] = useState("")
  const [location, setLocation] = useState("")
  const [formation, setFormation] = useState<string>("4-3-3")
  const [starters, setStarters] = useState<(number | null)[]>(Array(11).fill(null))
  const [substituteIds, setSubstituteIds] = useState<number[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (userRole !== "admin") {
      router.push("/login")
      return
    }
    setIsAuthorized(true)

    async function loadData() {
      setIsLoading(true)
      try {
        const [upcomingMatches, { data: playerData }] = await Promise.all([
          getUpcomingMatches(undefined, 10, OUR_TEAM_ID),
          adminGetPlayers("name"),
        ])
        setMatches(upcomingMatches)
        setPlayers(playerData || [])
      } catch (err) {
        console.error("Error loading create-lineup data:", err)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [router])

  // Keep the starting XI when the formation changes: players move to the
  // best matching slots in the new formation instead of being cleared.
  const handleFormationChange = (newFormation: string) => {
    setStarters((prev) => remapStarters(formation, newFormation, prev, (id) => players.find((p) => p.id === id)?.position))
    setFormation(newFormation)
  }

  const selectedMatch = useMemo(
    () => matches.find((m) => m.id.toString() === selectedMatchId) || null,
    [matches, selectedMatchId],
  )

  // Prefill the editable date/pitch fields once a match is picked.
  useEffect(() => {
    if (selectedMatch) {
      setMatchDate(selectedMatch.date)
      setLocation(selectedMatch.location)
    }
  }, [selectedMatch])

  const positions = FORMATIONS[formation] || []

  const handleStarterChange = (slotIndex: number, playerId: number) => {
    setStarters((prev) => {
      const next = [...prev]
      next[slotIndex] = playerId
      return next
    })
  }

  const toggleSubstitute = (playerId: number, checked: boolean) => {
    setSubstituteIds((prev) => (checked ? [...prev, playerId] : prev.filter((id) => id !== playerId)))
  }

  const startersFilled = starters.every((id) => id !== null)
  const canSave = !!selectedMatch && startersFilled && !isSaving

  const handleSave = async () => {
    if (!selectedMatch) {
      setError("Select an upcoming match first.")
      return
    }
    if (!startersFilled) {
      setError("Assign a player to every starting XI position.")
      return
    }
    setError("")
    setIsSaving(true)

    try {
      const isHome = selectedMatch.homeTeamId === OUR_TEAM_ID
      const opponent = isHome ? selectedMatch.awayTeam : selectedMatch.homeTeam
      const name = `${isHome ? selectedMatch.homeTeam : selectedMatch.awayTeam} vs. ${opponent}`

      const response = await fetch("/api/lineups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          formation,
          match_date: matchDate,
          location,
          match_id: selectedMatch.id,
          is_active: true,
          starters: starters.map((playerId, index) => ({
            player_id: playerId,
            position: positions[index],
            position_order: index + 1,
          })),
          substitutes: substituteIds.map((playerId, index) => ({
            player_id: playerId,
            position: players.find((p) => p.id === playerId)?.position || "SUB",
            position_order: positions.length + index + 1,
          })),
        }),
      })

      if (!response.ok) {
        const body = await response.json().catch(() => ({}))
        throw new Error(body.error || "Failed to create lineup")
      }

      toast({ title: "Lineup created", description: `${name} is ready.` })
      router.push("/admin/lineups")
    } catch (err) {
      console.error("Error creating lineup:", err)
      setError("Failed to create lineup. Please try again.")
      toast({ title: "Failed to create lineup", description: "Please try again.", variant: "destructive" })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return <Loading />
  }

  if (!isAuthorized) {
    return null // Router will redirect
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <main className="container mx-auto py-8 px-4 max-w-4xl">
        <AdminPageHeader title="Create Lineup" backHref="/admin/lineups" backLabel="Lineups" />

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarClock className="h-5 w-5 text-gray-500" />
              Upcoming Match
            </CardTitle>
            <CardDescription>Lineups can only be created for an upcoming, unplayed match.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {matches.length === 0 ? (
              <p className="text-sm text-gray-500">
                No upcoming matches found. Schedule a match before creating a lineup.
              </p>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="match">Match</Label>
                <Select value={selectedMatchId} onValueChange={setSelectedMatchId}>
                  <SelectTrigger id="match" className="h-12">
                    <SelectValue placeholder="Select an upcoming match" />
                  </SelectTrigger>
                  <SelectContent>
                    {matches.map((match) => {
                      const formattedDate = new Date(match.date).toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })
                      return (
                        <SelectItem key={match.id} value={match.id.toString()}>
                          <span className="flex items-center gap-3">
                            <Matchup
                              homeName={match.homeTeam}
                              homeLogo={match.homeTeamLogo}
                              awayName={match.awayTeam}
                              awayLogo={match.awayTeamLogo}
                              size={22}
                            />
                            <span className="text-sm text-gray-500 shrink-0">{formattedDate}</span>
                          </span>
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
              </div>
            )}

            {selectedMatch && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                <div className="space-y-2">
                  <Label htmlFor="matchDate">Date</Label>
                  <Input
                    id="matchDate"
                    type="date"
                    className="date-icon-left"
                    value={matchDate}
                    onChange={(e) => setMatchDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Pitch</Label>
                  <LocationCombobox value={location} onChange={setLocation} options={locationSuggestions} />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {selectedMatch && (
          <>
            <LineupPlayersForm
              players={players}
              formation={formation}
              onFormationChange={handleFormationChange}
              starters={starters}
              onStarterChange={handleStarterChange}
              substituteIds={substituteIds}
              onToggleSubstitute={toggleSubstitute}
            />

            {error && <p className="text-sm text-red-500 mb-4">{error}</p>}

            <div className="flex justify-end gap-2">
              <LineupPreviewDialog players={players} formation={formation} starters={starters} substituteIds={substituteIds} />
              <Button className="bg-black" disabled={!canSave} onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? "Creating..." : "Create Lineup"}
              </Button>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
