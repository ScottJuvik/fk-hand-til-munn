"use client"

import { useState, useEffect, useMemo } from "react"
import { getPlayersPageData, getRecentStatChanges, type PlayerStatChangeItem } from "@/actions/public-data"
import type { PlayerWithStats } from "@/types/supabase"
import { PlayerCard } from "@/components/player-card"
import { StatChangeTicker } from "@/components/stat-change-ticker"
import { AlertCircle, Search } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { SegmentedControl } from "@/components/ui/segmented-control"
import Loading from "./loading"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

const DEFENDER_POSITIONS = ["CB", "LB", "RB", "LWB", "RWB"]
const MIDFIELDER_POSITIONS = ["CDM", "CM", "CAM", "LM", "RM"]
const ATTACKER_POSITIONS = ["CF", "ST", "LW", "RW"]
// Players with any other position (e.g. "Medic", "Ultras") aren't shown
// in a section, so they have no card to link to.
const CARD_POSITIONS = ["GK", ...DEFENDER_POSITIONS, ...MIDFIELDER_POSITIONS, ...ATTACKER_POSITIONS]

/* ---------- Section Divider ---------- */
const SectionDivider = () => (
  <div className="my-14 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
)

export default function PlayersPage() {
  const [loading, setLoading] = useState(true)
  const [players, setPlayers] = useState<PlayerWithStats[]>([])
  const [statChanges, setStatChanges] = useState<PlayerStatChangeItem[]>([])
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedPosition, setSelectedPosition] = useState("All")
  const [squadView, setSquadViewState] = useState<"current" | "icons">("current")

  // The chosen view is kept in the URL (?view=icons), so a refresh stays on it.
  const setSquadView = (view: "current" | "icons") => {
    setSquadViewState(view)
    const url = new URL(window.location.href)
    if (view === "icons") url.searchParams.set("view", "icons")
    else url.searchParams.delete("view")
    window.history.replaceState(window.history.state, "", url)
  }
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("view") === "icons") setSquadViewState("icons")
  }, [])
  // Set from ?player=<id> (e.g. "View player profile" on the band page):
  // that player's card is scrolled into view and briefly highlighted.
  const [focusedPlayerId, setFocusedPlayerId] = useState<number | null>(null)
  // Shown instead when the linked player doesn't exist or has no card.
  const [missingCard, setMissingCard] = useState<{ title: string; description: string } | null>(null)

  useEffect(() => {
    async function fetchPlayers() {
      setLoading(true)
      try {
        // The ticker's changes load with the players, so it appears together
        // with the page instead of pushing it down a moment later.
        const [{ players: playersData, stats: statsData, images: imagesData, error }, changes] = await Promise.all([
          getPlayersPageData(),
          getRecentStatChanges().catch(() => []),
        ])

        if (error) throw new Error(error)

        const playersWithStats = playersData.map(player => {
          const stats = statsData.find(stat => stat.player_id === player.id)
          const image = imagesData.find(img => img.player_id === player.id)

          return {
            ...player,
            stats: stats || {},
            image_url: image?.playercard_url || null,
          }
        }) as PlayerWithStats[]

        setPlayers(playersWithStats)
        setStatChanges(changes)
      } catch (err) {
        console.error("Error fetching players:", err)
        setError("Failed to load player data. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchPlayers()
  }, [])

  // Once players are loaded, open the tab the linked player is on.
  useEffect(() => {
    if (players.length === 0) return
    const param = new URLSearchParams(window.location.search).get("player")
    if (!param) return
    const target = players.find((p) => p.id === Number(param))
    if (!target) {
      setMissingCard({
        title: "Player not found",
        description: "We couldn't find that player in the squad. They may have left the club.",
      })
      return
    }
    if (!CARD_POSITIONS.includes(target.position)) {
      setMissingCard({
        title: `No player card for ${target.name}`,
        description: `${target.name} supports the team from the sidelines as ${target.position}, so there's no player card to show. Take a look at the rest of the squad instead!`,
      })
      return
    }
    setSquadView(target.is_icon ? "icons" : "current")
    setSearchTerm("")
    setSelectedPosition("All")
    setFocusedPlayerId(target.id)
  }, [players])

  // After that tab renders, scroll to the card and fade the highlight out.
  useEffect(() => {
    if (focusedPlayerId === null) return
    // Instant jump: smooth scrolling can stall right after navigating here.
    document.getElementById(`player-${focusedPlayerId}`)?.scrollIntoView({ block: "center" })
    const timeout = setTimeout(() => setFocusedPlayerId(null), 2500)
    return () => clearTimeout(timeout)
  }, [focusedPlayerId])

  const renderPlayerCard = (player: PlayerWithStats) => (
    <div
      key={player.id}
      id={`player-${player.id}`}
      className={`w-fit rounded-2xl transition-shadow duration-700 ${
        focusedPlayerId === player.id ? "ring-4 ring-[#D4AF37] ring-offset-4 ring-offset-gray-100" : ""
      }`}
    >
      <PlayerCard player={player} />
    </div>
  )

  const positions = ["All", "GK", "Defender", "Midfielder", "Attacker"]

  // ---------- FILTERED PLAYERS (client-side, in-memory) ----------
  const filteredPlayers = useMemo(() => {
    return players.filter(player => {
      const matchesSquadView = squadView === "current" ? !player.is_icon : !!player.is_icon

      const matchesSearch =
        player.name?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false

      const matchesPosition =
        selectedPosition === "All" ||
        (selectedPosition === "Defender" &&
          DEFENDER_POSITIONS.includes(player.position)) ||
        (selectedPosition === "Midfielder" &&
          MIDFIELDER_POSITIONS.includes(player.position)) ||
        (selectedPosition === "Attacker" &&
          ATTACKER_POSITIONS.includes(player.position)) ||
        player.position === selectedPosition

      return matchesSquadView && matchesSearch && matchesPosition
    })
  }, [players, searchTerm, selectedPosition, squadView])

  // ---------- FILTERED BY POSITION ----------
  const goalkeepers = useMemo(
    () => filteredPlayers.filter(p => p.position === "GK"),
    [filteredPlayers]
  )
  const defenders = useMemo(
    () => filteredPlayers.filter(p =>
      DEFENDER_POSITIONS.includes(p.position)
    ),
    [filteredPlayers]
  )
  const midfielders = useMemo(
    () => filteredPlayers.filter(p =>
      MIDFIELDER_POSITIONS.includes(p.position)
    ),
    [filteredPlayers]
  )
  const attackers = useMemo(
    () => filteredPlayers.filter(p =>
      ATTACKER_POSITIONS.includes(p.position)
    ),
    [filteredPlayers]
  )

  if (loading) {
    return <Loading />
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 pb-12">
      <Dialog open={missingCard !== null} onOpenChange={(open) => !open && setMissingCard(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{missingCard?.title}</DialogTitle>
            <DialogDescription>{missingCard?.description}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setMissingCard(null)}>Browse the squad</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <StatChangeTicker changes={statChanges} />

      <div className="container mx-auto px-4 pt-12">
        <div className="max-w-6xl mx-auto">

          {/* Header + Search/Filter */}
          <div className="mb-8">
            {/* The heading follows the toggle: the current squad, or the club's former players. */}
            <h1 className="text-4xl font-bold mb-4">
              {squadView === "icons" ? "FK Hånd til Munn Legends" : "FK Hånd til Munn Squad"}
            </h1>
            <p className="text-gray-600 mb-6">
              {squadView === "icons"
                ? "The former players who built this club, and the icons who lived V-V-V before us"
                : "Meet our talented players who embody the spirit of Vold, Vilje, and Vaselin"}
            </p>

            <SegmentedControl
              aria-label="Squad"
              className="mb-6"
              value={squadView}
              onChange={setSquadView}
              options={[
                { value: "current", label: "Current Squad" },
                { value: "icons", label: "Icons" },
              ]}
            />

            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search players..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <SegmentedControl
                aria-label="Position"
                // One row on phones: options share the full width instead of wrapping.
                className="flex w-full flex-nowrap sm:inline-flex sm:w-auto sm:self-start"
                itemClassName="flex-auto px-1.5 text-[13px] sm:flex-none sm:px-3 sm:text-sm"
                value={selectedPosition}
                onChange={setSelectedPosition}
                options={positions.map((position) => ({ value: position, label: position }))}
              />
            </div>
          </div>

          {/* ---------- Players Sections ---------- */}
          {filteredPlayers.length === 0 ? (
            <div className="text-center text-gray-500 text-lg mt-12">
              No players match your search/filter.
            </div>
          ) : (
            <div className="space-y-0">

              {goalkeepers.length > 0 && (
                <div>
                  <h2 className="text-4xl font-bold mb-4">Goalkeepers</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {goalkeepers.map(renderPlayerCard)}
                  </div>
                </div>
              )}

              {defenders.length > 0 && (
                <>
                  <SectionDivider />
                  <div>
                    <h2 className="text-4xl font-bold mb-4">Defenders</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                      {defenders.map(renderPlayerCard)}
                    </div>
                  </div>
                </>
              )}

              {midfielders.length > 0 && (
                <>
                  <SectionDivider />
                  <div>
                    <h2 className="text-4xl font-bold mb-4">Midfielders</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                      {midfielders.map(renderPlayerCard)}
                    </div>
                  </div>
                </>
              )}

              {attackers.length > 0 && (
                <>
                  <SectionDivider />
                  <div>
                    <h2 className="text-4xl font-bold mb-4">Attackers</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                      {attackers.map(renderPlayerCard)}
                    </div>
                  </div>
                </>
              )}

            </div>
          )}

        </div>
      </div>
    </div>
  )
}
