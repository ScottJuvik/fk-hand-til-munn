"use client"

import { Fragment, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { CheckCircle2, Plus, Trash2, ChevronDown, Calendar, Undo2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Loading from "./loading"
import { LocationCombobox } from "@/components/admin/location-combobox"
import { TeamLogo } from "@/components/admin/team-logo"
import { Matchup } from "@/components/admin/matchup"
import { LeagueBadge, LeagueDivider } from "@/components/admin/league-badge"
import { useLocationSuggestions } from "@/hooks/use-location-suggestions"
import { adminGetMatches } from "@/actions/admin-data"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/components/auth-provider"
import { AdminPageHeader } from "@/components/admin/admin-page-header"

interface MatchRow {
  id: number
  match_date: string
  match_time: string
  location: string
  home_score: number | null
  away_score: number | null
  homeTeamId: number
  awayTeamId: number
  homeTeamName: string
  /** Abbreviation (teams.short_name, e.g. "HTM"), shown under the score boxes. */
  homeTeamShort: string
  awayTeamShort: string
  awayTeamName: string
  homeTeamLogo: string | null
  awayTeamLogo: string | null
  leagueId: number | null
  leagueName: string
  leagueYear: number | null
}

function mapRow(m: any): MatchRow {
  return {
    id: m.id,
    match_date: m.match_date,
    match_time: m.match_time,
    location: m.location,
    home_score: m.home_score,
    away_score: m.away_score,
    homeTeamId: m.home_team?.id,
    awayTeamId: m.away_team?.id,
    homeTeamName: m.home_team?.name || "TBD",
    awayTeamName: m.away_team?.name || "TBD",
    homeTeamShort: m.home_team?.short_name || m.home_team?.name || "TBD",
    awayTeamShort: m.away_team?.short_name || m.away_team?.name || "TBD",
    homeTeamLogo: m.home_team?.logo_url || null,
    awayTeamLogo: m.away_team?.logo_url || null,
    leagueId: m.league?.id ?? null,
    leagueName: m.league?.name || "—",
    leagueYear: m.league?.year ?? null,
  }
}

export default function ManageMatches() {
  const router = useRouter()
  const { userRole } = useAuth()
  const { toast } = useToast()
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [upcomingMatches, setUpcomingMatches] = useState<MatchRow[]>([])
  const [previousMatches, setPreviousMatches] = useState<MatchRow[]>([])
  const [savingResultId, setSavingResultId] = useState<number | null>(null)
  const [revertingId, setRevertingId] = useState<number | null>(null)
  const [resultDrafts, setResultDrafts] = useState<Record<number, { home: string; away: string }>>({})
  const locationSuggestions = useLocationSuggestions()
  const [deleteDialogId, setDeleteDialogId] = useState<number | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set())

  const toggleExpanded = (matchId: number) => {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(matchId)) next.delete(matchId)
      else next.add(matchId)
      return next
    })
  }

  useEffect(() => {
    if (userRole !== "admin") {
      router.push("/login")
      return
    }
    setIsAuthorized(true)

    fetchMatches()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router])

  async function fetchMatches() {
    setIsLoading(true)
    try {
      const {
        upcoming: upcomingData,
        previous: previousData,
        upcomingError,
        previousError,
      } = await adminGetMatches()

      if (upcomingError) {
        console.error("Error fetching upcoming matches:", upcomingError)
      } else {
        const mapped = (upcomingData || []).map(mapRow)
        setUpcomingMatches(mapped)
        // Only the soonest fixture starts expanded; the rest stay squashed
        // until clicked.
        if (mapped.length > 0) setExpandedIds(new Set([mapped[0].id]))
      }

      if (previousError) console.error("Error fetching previous matches:", previousError)
      else setPreviousMatches((previousData || []).map(mapRow))
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const updateMatchInState = (matchId: number, field: keyof MatchRow, value: string) => {
    const updater = (rows: MatchRow[]) => rows.map((m) => (m.id === matchId ? { ...m, [field]: value } : m))
    setUpcomingMatches(updater)
    setPreviousMatches(updater)
  }

  const getResultDraft = (match: MatchRow) =>
    resultDrafts[match.id] || {
      home: match.home_score !== null ? String(match.home_score) : "",
      away: match.away_score !== null ? String(match.away_score) : "",
    }

  const handleResultChange = (matchId: number, side: "home" | "away", value: string, match: MatchRow) => {
    setResultDrafts((prev) => ({
      ...prev,
      [matchId]: { ...getResultDraft(match), [side]: value },
    }))
  }

  const handleSaveResult = async (match: MatchRow) => {
    const draft = getResultDraft(match)
    const homeScore = Number.parseInt(draft.home)
    const awayScore = Number.parseInt(draft.away)

    if (isNaN(homeScore) || isNaN(awayScore)) {
      toast({ title: "Enter both scores first", variant: "destructive" })
      return
    }

    setSavingResultId(match.id)
    try {
      const response = await fetch(`/api/matches/${match.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ homeScore, awayScore, played: true }),
      })

      if (!response.ok) {
        throw new Error("Failed to save result")
      }

      toast({ title: "Result saved" })

      if (upcomingMatches.some((m) => m.id === match.id)) {
        // Moves from Upcoming to Previous Matches instead of just vanishing.
        const remaining = upcomingMatches.filter((m) => m.id !== match.id)
        setUpcomingMatches(remaining)
        setPreviousMatches((prev) => [{ ...match, home_score: homeScore, away_score: awayScore }, ...prev])
        setExpandedIds((prev) => {
          const next = new Set(prev)
          next.delete(match.id)
          // The new soonest fixture takes over the "expanded by default" spot.
          if (remaining.length > 0) next.add(remaining[0].id)
          return next
        })
      } else {
        setPreviousMatches((prev) =>
          prev.map((m) => (m.id === match.id ? { ...m, home_score: homeScore, away_score: awayScore } : m)),
        )
      }
    } catch (error) {
      console.error("Error saving result:", error)
      toast({ title: "Failed to save result", description: "Please try again.", variant: "destructive" })
    } finally {
      setSavingResultId(null)
    }
  }

  const handleUnmarkPlayed = async (match: MatchRow) => {
    setRevertingId(match.id)
    try {
      const response = await fetch(`/api/matches/${match.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ homeScore: null, awayScore: null, played: false }),
      })

      if (!response.ok) {
        throw new Error("Failed to revert match")
      }

      toast({ title: "Moved back to Upcoming" })

      const reverted = { ...match, home_score: null, away_score: null }
      setResultDrafts((prev) => {
        const { [match.id]: _, ...rest } = prev
        return rest
      })
      setPreviousMatches((prev) => prev.filter((m) => m.id !== match.id))
      setUpcomingMatches((prev) => {
        const next = [...prev, reverted].sort((a, b) => {
          const aWhen = `${a.match_date}T${a.match_time}`
          const bWhen = `${b.match_date}T${b.match_time}`
          return aWhen.localeCompare(bWhen)
        })
        return next
      })
      setExpandedIds((prev) => new Set(prev).add(match.id))
    } catch (error) {
      console.error("Error reverting match:", error)
      toast({ title: "Failed to revert match", description: "Please try again.", variant: "destructive" })
    } finally {
      setRevertingId(null)
    }
  }

  const confirmDelete = async () => {
    if (deleteDialogId === null) return

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/matches/${deleteDialogId}`, { method: "DELETE" })

      if (!response.ok) {
        throw new Error("Failed to delete fixture")
      }

      setUpcomingMatches((prev) => prev.filter((m) => m.id !== deleteDialogId))
      setPreviousMatches((prev) => prev.filter((m) => m.id !== deleteDialogId))
      setExpandedIds((prev) => {
        const next = new Set(prev)
        next.delete(deleteDialogId)
        return next
      })
      toast({ title: "Fixture deleted" })
    } catch (error) {
      console.error("Error deleting fixture:", error)
      toast({ title: "Failed to delete fixture", description: "Please try again.", variant: "destructive" })
    } finally {
      setIsDeleting(false)
      setDeleteDialogId(null)
    }
  }

  if (isLoading) {
    return <Loading />
  }

  if (!isAuthorized) {
    return null // Router will redirect
  }

  const formatMatchWhen = (match: MatchRow) => {
    const date = new Date(`${match.match_date}T${match.match_time}`)
    const dateStr = date.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })
    return `${dateStr} · ${match.match_time}`
  }

  const renderCollapsedRow = (match: MatchRow, mode: "upcoming" | "previous") => (
    <button
      key={match.id}
      type="button"
      onClick={() => toggleExpanded(match.id)}
      className="w-full flex items-center justify-between gap-3 bg-white border rounded-lg px-4 py-3 text-left hover:bg-gray-50 hover:border-gray-300 transition-colors"
    >
      {/* Phones: one team per line (score beside it once played) so names aren't cut off. */}
      <div className="md:hidden flex flex-1 flex-col gap-1 min-w-0">
        {[
          { name: match.homeTeamName, logo: match.homeTeamLogo, score: match.home_score },
          { name: match.awayTeamName, logo: match.awayTeamLogo, score: match.away_score },
        ].map((team, i) => (
          <div key={i} className="flex items-center gap-2 min-w-0">
            <TeamLogo url={team.logo} name={team.name} size={20} />
            <span className="font-medium truncate">{team.name}</span>
            {mode === "previous" && match.home_score !== null && match.away_score !== null && (
              <span className="ml-auto pl-2 font-semibold text-gray-700 shrink-0">{team.score}</span>
            )}
          </div>
        ))}
      </div>
      <div className="hidden md:flex items-center gap-2 min-w-0">
        <TeamLogo url={match.homeTeamLogo} name={match.homeTeamName} size={20} />
        <span className="font-medium truncate">{match.homeTeamName}</span>
        {mode === "previous" && match.home_score !== null && match.away_score !== null && (
          <span className="text-sm font-semibold text-gray-700 shrink-0">
            {match.home_score} - {match.away_score}
          </span>
        )}
        <span className="text-gray-400 text-xs shrink-0">vs</span>
        <span className="font-medium truncate">{match.awayTeamName}</span>
        <TeamLogo url={match.awayTeamLogo} name={match.awayTeamName} size={20} />
      </div>
      <div className="flex items-center gap-3 text-sm text-gray-500 shrink-0">
        <span className="hidden sm:flex items-center gap-1">
          <Calendar className="h-3.5 w-3.5" />
          {formatMatchWhen(match)}
        </span>
        <LeagueBadge name={match.leagueName} className="hidden md:inline-flex" />
        {mode === "previous" && (
          <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Played</Badge>
        )}
        <ChevronDown className="h-4 w-4" />
      </div>
    </button>
  )

  const renderMatchCard = (match: MatchRow, mode: "upcoming" | "previous") => {
    const draft = getResultDraft(match)
    return (
      <Card key={match.id}>
        <CardHeader
          className="pb-2 cursor-pointer select-none"
          onClick={() => toggleExpanded(match.id)}
          role="button"
          aria-expanded="true"
        >
          <CardTitle className="flex items-center justify-between flex-wrap gap-2">
            {/* Phones: one team per line so neither name gets cut off. */}
            <div className="md:hidden text-base min-w-0">
              <Matchup
                homeName={match.homeTeamName}
                homeLogo={match.homeTeamLogo}
                awayName={match.awayTeamName}
                awayLogo={match.awayTeamLogo}
                size={28}
                stacked
              />
            </div>
            <div className="hidden md:flex items-center gap-2 text-base font-semibold">
              <TeamLogo url={match.homeTeamLogo} name={match.homeTeamName} size={28} />
              <span>{match.homeTeamName}</span>
              <span className="text-gray-400 font-normal text-sm px-1">vs</span>
              <span>{match.awayTeamName}</span>
              <TeamLogo url={match.awayTeamLogo} name={match.awayTeamName} size={28} />
            </div>
            <div className="flex items-center gap-2">
              <LeagueBadge name={match.leagueName} />
              {mode === "previous" && (
                <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Played</Badge>
              )}
              <span className="flex h-9 w-9 items-center justify-center rounded-md text-gray-500">
                <ChevronDown className="h-4 w-4 rotate-180" />
              </span>
              <Separator orientation="vertical" className="hidden md:block h-5" />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="hidden md:inline-flex text-red-500 hover:text-red-600 hover:bg-red-50"
                onClick={(e) => {
                  e.stopPropagation()
                  setDeleteDialogId(match.id)
                }}
                aria-label="Delete fixture"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div className="space-y-2">
              <Label htmlFor={`date-${match.id}`}>Date</Label>
              <Input
                id={`date-${match.id}`}
                type="date"
                className="date-icon-left"
                value={match.match_date}
                onChange={(e) => updateMatchInState(match.id, "match_date", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`time-${match.id}`}>Time</Label>
              <Input
                id={`time-${match.id}`}
                type="time"
                className="date-icon-left"
                value={match.match_time}
                onChange={(e) => updateMatchInState(match.id, "match_time", e.target.value)}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Location</Label>
              <LocationCombobox
                value={match.location}
                onChange={(value) => updateMatchInState(match.id, "location", value)}
                options={locationSuggestions}
              />
            </div>
          </div>

          {/* Equal outer columns keep the scoreboard centred on the card
              while the actions sit on the same line to its right. */}
          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] items-center gap-4">
            <div className="hidden md:block" />
            {/* Fixed-width team columns keep the score inputs centred on
                every card, regardless of team name length. */}
            <div className="flex items-center justify-center gap-2 sm:gap-6 py-2">
              <div className="flex w-16 sm:w-32 flex-col items-center gap-1 text-center">
                <TeamLogo url={match.homeTeamLogo} name={match.homeTeamName} size={40} />
                <span className="text-xs font-medium text-gray-600 line-clamp-2" title={match.homeTeamName}>{match.homeTeamShort}</span>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min="0"
                  aria-label={`${match.homeTeamName} score`}
                  className="h-14 w-14 sm:w-16 text-center text-2xl font-bold"
                  value={draft.home}
                  onChange={(e) => handleResultChange(match.id, "home", e.target.value, match)}
                />
                <span className="text-2xl font-bold text-gray-400">-</span>
                <Input
                  type="number"
                  min="0"
                  aria-label={`${match.awayTeamName} score`}
                  className="h-14 w-14 sm:w-16 text-center text-2xl font-bold"
                  value={draft.away}
                  onChange={(e) => handleResultChange(match.id, "away", e.target.value, match)}
                />
              </div>
              <div className="flex w-16 sm:w-32 flex-col items-center gap-1 text-center">
                <TeamLogo url={match.awayTeamLogo} name={match.awayTeamName} size={40} />
                <span className="text-xs font-medium text-gray-600 line-clamp-2" title={match.awayTeamName}>{match.awayTeamShort}</span>
              </div>
            </div>

            {/* Phones: delete (and revert) bottom-left, save bottom-right. */}
            <div className="flex items-center justify-between md:justify-end md:self-end md:pb-2 gap-2">
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="md:hidden text-red-500 hover:text-red-600 hover:bg-red-50"
                  onClick={() => setDeleteDialogId(match.id)}
                  aria-label="Delete fixture"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                {mode === "previous" && (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={revertingId === match.id}
                    onClick={() => handleUnmarkPlayed(match)}
                  >
                    <Undo2 className="h-4 w-4 mr-1" />
                    {revertingId === match.id ? "Reverting..." : "Revert"}
                  </Button>
                )}
              </div>
              <Button size="sm" disabled={savingResultId === match.id} onClick={() => handleSaveResult(match)}>
                <CheckCircle2 className="h-4 w-4 mr-1" />
                {savingResultId === match.id
                  ? "Saving..."
                  : mode === "upcoming"
                    ? "Mark Played"
                    : "Save"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <main className="container mx-auto py-8 px-4">
        <AdminPageHeader
          title="Manage Matches"
          backHref="/admin/dashboard"
          backLabel="Dashboard"
          action={
            <Button asChild>
              <Link href="/admin/matches/create">
                <Plus className="h-4 w-4 mr-2" />
                Add Fixture
              </Link>
            </Button>
          }
        />

        <Tabs defaultValue="upcoming">
          <TabsList className="mb-6">
            <TabsTrigger value="upcoming">Upcoming ({upcomingMatches.length})</TabsTrigger>
            <TabsTrigger value="previous">Previous Matches ({previousMatches.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming">
            {upcomingMatches.length === 0 && (
              <Card>
                <CardContent className="py-12 text-center text-gray-500">No upcoming matches scheduled.</CardContent>
              </Card>
            )}
            <div className="space-y-3">
              {upcomingMatches.map((match, index) => (
                <Fragment key={match.id}>
                  {(index === 0 || upcomingMatches[index - 1].leagueId !== match.leagueId) && (
                    <LeagueDivider name={match.leagueName} year={match.leagueYear} first={index === 0} />
                  )}
                  {expandedIds.has(match.id) ? renderMatchCard(match, "upcoming") : renderCollapsedRow(match, "upcoming")}
                </Fragment>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="previous">
            {previousMatches.length === 0 && (
              <Card>
                <CardContent className="py-12 text-center text-gray-500">No previous matches yet.</CardContent>
              </Card>
            )}
            <div className="space-y-3">
              {previousMatches.map((match, index) => (
                <Fragment key={match.id}>
                  {(index === 0 || previousMatches[index - 1].leagueId !== match.leagueId) && (
                    <LeagueDivider name={match.leagueName} year={match.leagueYear} first={index === 0} />
                  )}
                  {expandedIds.has(match.id) ? renderMatchCard(match, "previous") : renderCollapsedRow(match, "previous")}
                </Fragment>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <Dialog open={deleteDialogId !== null} onOpenChange={(open) => !open && setDeleteDialogId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Fixture</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this fixture? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogId(null)}>
              Cancel
            </Button>
            <Button variant="destructive" disabled={isDeleting} onClick={confirmDelete}>
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
