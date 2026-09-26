"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Minus, Plus, Save, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import Loading from "./loading"
import { adminGetLeagueStatistics } from "@/actions/admin-data"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/components/auth-provider"
import { AdminPageHeader } from "@/components/admin/admin-page-header"

// The current season. Matches the convention used elsewhere in the app
// (e.g. getLeagueById(4) on the homepage).
const CURRENT_LEAGUE_ID = 4

interface PlayerRow {
  player_id: number
  name: string
  nickname: string | null
  is_icon: boolean
  matches_played: number
  goals: number
  assists: number
  yellow_cards: number
  red_cards: number
  minutes_played: number
}

type StatField = "matches_played" | "goals" | "assists" | "yellow_cards" | "red_cards" | "minutes_played"

// Shared by the desktop table and the mobile cards. `step` is what the
// mobile +/- buttons add or remove.
const STAT_FIELDS: {
  field: StatField
  label: string
  short: string
  headWidth: string
  width: string
  step: number
}[] = [
  { field: "matches_played", headWidth: "w-20", label: "Matches", short: "Matches", width: "w-16", step: 1 },
  { field: "goals", headWidth: "w-20", label: "Goals", short: "Goals", width: "w-16", step: 1 },
  { field: "assists", headWidth: "w-20", label: "Assists", short: "Assists", width: "w-16", step: 1 },
  { field: "yellow_cards", headWidth: "w-16", label: "Yellow cards", short: "YC", width: "w-14", step: 1 },
  { field: "red_cards", headWidth: "w-16", label: "Red cards", short: "RC", width: "w-14", step: 1 },
  { field: "minutes_played", headWidth: "w-24", label: "Minutes", short: "Minutes", width: "w-20", step: 10 },
]

export default function ManageStatistics() {
  const router = useRouter()
  const { userRole } = useAuth()
  const { toast } = useToast()
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [rows, setRows] = useState<PlayerRow[]>([])
  const [savingId, setSavingId] = useState<number | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [showIcons, setShowIcons] = useState(false)

  useEffect(() => {
    if (userRole !== "admin") {
      router.push("/login")
      return
    }
    setIsAuthorized(true)

    async function fetchData() {
      setIsLoading(true)
      try {
        const { players, stats, error } = await adminGetLeagueStatistics(CURRENT_LEAGUE_ID)

        if (error) {
          console.error(error)
          return
        }

        const merged = (players || []).map((player) => {
          const stat = stats?.find((s) => s.player_id === player.id)
          return {
            player_id: player.id,
            name: player.name,
            nickname: player.nickname,
            is_icon: !!player.is_icon,
            matches_played: stat?.matches_played ?? 0,
            goals: stat?.goals ?? 0,
            assists: stat?.assists ?? 0,
            yellow_cards: stat?.yellow_cards ?? 0,
            red_cards: stat?.red_cards ?? 0,
            minutes_played: stat?.minutes_played ?? 0,
          }
        })

        setRows(merged)
      } catch (error) {
        console.error("Error:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [router])

  const filteredRows = useMemo(() => {
    const bySquad = showIcons ? rows : rows.filter((row) => !row.is_icon)

    if (!searchTerm) return bySquad
    const term = searchTerm.toLowerCase()
    return bySquad.filter(
      (row) => row.name.toLowerCase().includes(term) || row.nickname?.toLowerCase().includes(term),
    )
  }, [rows, searchTerm, showIcons])

  const handleFieldChange = (playerId: number, field: keyof PlayerRow, value: string) => {
    const parsed = Number.parseInt(value)
    setRows((prev) =>
      prev.map((row) => (row.player_id === playerId ? { ...row, [field]: isNaN(parsed) ? 0 : parsed } : row)),
    )
  }

  const handleStep = (playerId: number, field: StatField, delta: number) => {
    setRows((prev) =>
      prev.map((row) => (row.player_id === playerId ? { ...row, [field]: Math.max(0, row[field] + delta) } : row)),
    )
  }

  const handleSave = async (row: PlayerRow) => {
    setSavingId(row.player_id)
    try {
      const response = await fetch("/api/player-statistics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          player_id: row.player_id,
          league: CURRENT_LEAGUE_ID,
          matches_played: row.matches_played,
          goals: row.goals,
          assists: row.assists,
          yellow_cards: row.yellow_cards,
          red_cards: row.red_cards,
          minutes_played: row.minutes_played,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to save statistics")
      }

      toast({ title: `${row.name}'s stats updated` })
    } catch (error) {
      console.error("Error saving statistics:", error)
      toast({ title: "Failed to save statistics", description: "Please try again.", variant: "destructive" })
    } finally {
      setSavingId(null)
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
      <main className="container mx-auto py-6 md:py-8 px-4">
        <AdminPageHeader title="Manage Season Stats" backHref="/admin/dashboard" backLabel="Dashboard" />

        <div className="flex flex-wrap items-center gap-4 mb-4">
          <div className="relative w-full sm:max-w-sm flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search players..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="showIcons"
              checked={showIcons}
              onCheckedChange={(checked) => setShowIcons(checked === true)}
            />
            <Label htmlFor="showIcons" className="font-normal cursor-pointer">
              Show icons
            </Label>
          </div>
        </div>

        {/* Mobile: one card per player with large tap targets. */}
        <div className="space-y-3 md:hidden">
          {filteredRows.map((row) => (
            <div key={row.player_id} className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="min-w-0">
                  <p className="font-semibold truncate">{row.name}</p>
                  {row.nickname && <p className="text-xs text-gray-500 truncate">{row.nickname}</p>}
                </div>
                <Button size="sm" disabled={savingId === row.player_id} onClick={() => handleSave(row)}>
                  <Save className="h-4 w-4 mr-1" />
                  {savingId === row.player_id ? "Saving..." : "Save"}
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-x-3 gap-y-3">
                {STAT_FIELDS.map(({ field, label, step }) => (
                  <div key={field}>
                    <Label htmlFor={`${field}-${row.player_id}`} className="text-xs text-gray-500">
                      {label}
                    </Label>
                    <div className="mt-1 flex items-center gap-1">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="shrink-0"
                        aria-label={`Decrease ${label}`}
                        onClick={() => handleStep(row.player_id, field, -step)}
                        disabled={row[field] <= 0}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <Input
                        id={`${field}-${row.player_id}`}
                        type="number"
                        inputMode="numeric"
                        min="0"
                        className="h-10 min-w-0 text-center text-base"
                        value={row[field]}
                        onChange={(e) => handleFieldChange(row.player_id, field, e.target.value)}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="shrink-0"
                        aria-label={`Increase ${label}`}
                        onClick={() => handleStep(row.player_id, field, step)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {filteredRows.length === 0 && (
            <div className="bg-white rounded-lg shadow py-8 text-center text-gray-500">No players match your search.</div>
          )}
        </div>

        {/* Desktop: editable table. */}
        <div className="hidden md:block bg-white rounded-lg shadow overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Player</TableHead>
                {STAT_FIELDS.map(({ field, short, headWidth }) => (
                  <TableHead key={field} className={headWidth}>
                    {short}
                  </TableHead>
                ))}
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRows.map((row) => (
                <TableRow key={row.player_id}>
                  <TableCell className="font-medium whitespace-nowrap">{row.name}</TableCell>
                  {STAT_FIELDS.map(({ field, label, width }) => (
                    <TableCell key={field}>
                      <Input
                        type="number"
                        min="0"
                        aria-label={`${row.name} ${label}`}
                        className={width}
                        value={row[field]}
                        onChange={(e) => handleFieldChange(row.player_id, field, e.target.value)}
                      />
                    </TableCell>
                  ))}
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      disabled={savingId === row.player_id}
                      onClick={() => handleSave(row)}
                    >
                      <Save className="h-4 w-4 mr-1" />
                      {savingId === row.player_id ? "Saving..." : "Save"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {filteredRows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={STAT_FIELDS.length + 2} className="text-center text-gray-500 py-8">
                    No players match your search.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </main>
    </div>
  )
}
