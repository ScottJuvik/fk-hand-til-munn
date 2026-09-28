"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Loading from "./loading"
import { LineupPlayersForm } from "@/components/admin/lineup-players-form"
import { LineupPreviewDialog } from "@/components/admin/lineup-preview-dialog"
import { LocationCombobox } from "@/components/admin/location-combobox"
import { Matchup } from "@/components/admin/matchup"
import { useLocationSuggestions } from "@/hooks/use-location-suggestions"
import { adminGetLineup, adminGetPlayers } from "@/actions/admin-data"
import { FORMATIONS, remapStarters } from "@/utils/formations"
import { useToast } from "@/hooks/use-toast"
import type { Player } from "@/types/supabase"
import { useAuth } from "@/components/auth-provider"
import { AdminPageHeader } from "@/components/admin/admin-page-header"

export default function EditLineup({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { userRole } = useAuth()
  const { toast } = useToast()
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  const [players, setPlayers] = useState<Player[]>([])
  const [matchId, setMatchId] = useState<number | null>(null)
  const [homeTeam, setHomeTeam] = useState<{ name: string; logo: string | null } | null>(null)
  const [awayTeam, setAwayTeam] = useState<{ name: string; logo: string | null } | null>(null)
  const locationSuggestions = useLocationSuggestions()
  const [matchDate, setMatchDate] = useState("")
  const [location, setLocation] = useState("")
  const [formation, setFormation] = useState("4-3-3")
  const [starters, setStarters] = useState<(number | null)[]>(Array(11).fill(null))
  const [substituteIds, setSubstituteIds] = useState<number[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState("")
  // Sent with the save, so it's refused if someone else changed the lineup meanwhile.
  const [version, setVersion] = useState<string | null>(null)

  useEffect(() => {
    if (userRole !== "admin") {
      router.push("/login")
      return
    }
    setIsAuthorized(true)

    async function loadData() {
      setIsLoading(true)
      try {
        const [{ lineup, match, lineupPlayers, error: lineupError }, { data: playerData }] = await Promise.all([
          adminGetLineup(params.id),
          adminGetPlayers("name"),
        ])

        if (lineupError || !lineup) {
          setNotFound(true)
          return
        }

        setVersion(lineup.updated_at)
        setPlayers(playerData || [])
        setFormation(lineup.formation)
        setMatchDate(lineup.match_date || "")

        if (lineup.match_id) {
          setMatchId(lineup.match_id)
          if (match) {
            const home: any = match.home_team
            const away: any = match.away_team
            setLocation(match.location || "")
            setHomeTeam({ name: home?.name || "Home", logo: home?.logo_url || null })
            setAwayTeam({ name: away?.name || "Away", logo: away?.logo_url || null })
          }
        }

        if (lineupPlayers) {
          const slotCount = FORMATIONS[lineup.formation]?.length || 11
          const nextStarters: (number | null)[] = Array(slotCount).fill(null)
          const nextSubs: number[] = []

          lineupPlayers
            .filter((lp) => !lp.is_substitute)
            .forEach((lp, index) => {
              if (index < slotCount) nextStarters[index] = lp.player_id
            })

          lineupPlayers.filter((lp) => lp.is_substitute).forEach((lp) => nextSubs.push(lp.player_id))

          setStarters(nextStarters)
          setSubstituteIds(nextSubs)
        }
      } catch (err) {
        console.error("Error loading lineup:", err)
        setNotFound(true)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [params.id, router])

  const positions = FORMATIONS[formation] || []

  // Keep the starting XI when the formation changes: players move to the
  // best matching slots in the new formation instead of being cleared.
  const handleFormationChange = (newFormation: string) => {
    setStarters((prev) => remapStarters(formation, newFormation, prev, (id) => players.find((p) => p.id === id)?.position))
    setFormation(newFormation)
  }

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
  const canSave = startersFilled && !isSaving

  const handleSave = async () => {
    if (!startersFilled) {
      setError("Assign a player to every starting XI position.")
      return
    }
    setError("")
    setIsSaving(true)

    try {
      const name = `${homeTeam?.name ?? "FK Hånd til Munn"} vs. ${awayTeam?.name ?? ""}`

      const response = await fetch(`/api/lineups/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          formation,
          match_date: matchDate,
          location,
          match_id: matchId,
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
          version,
        }),
      })

      if (!response.ok) {
        const body = await response.json().catch(() => ({}))
        throw new Error(body.error || "Failed to update lineup")
      }

      toast({ title: "Lineup updated", description: `${name} was saved.` })
      router.push("/admin/lineups")
    } catch (err) {
      console.error("Error updating lineup:", err)
      const message = err instanceof Error ? err.message : "Please try again."
      setError(`Failed to update lineup. ${message}`)
      toast({ title: "Failed to update lineup", description: message, variant: "destructive" })
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

  if (notFound) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p>Lineup not found.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <main className="container mx-auto py-8 px-4 max-w-4xl">
        <AdminPageHeader title="Edit Lineup" backHref="/admin/lineups" backLabel="Lineups" />

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Upcoming Match</CardTitle>
            {homeTeam && awayTeam && (
              <div className="pt-1">
                <Matchup
                  homeName={homeTeam.name}
                  homeLogo={homeTeam.logo}
                  awayName={awayTeam.name}
                  awayLogo={awayTeam.logo}
                />
              </div>
            )}
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
          </CardContent>
        </Card>

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
            {isSaving ? "Saving..." : "Save Lineup"}
          </Button>
        </div>
      </main>
    </div>
  )
}
