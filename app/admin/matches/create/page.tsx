"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { CalendarPlus, ArrowLeftRight, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Loading from "./loading"
import { LocationCombobox } from "@/components/admin/location-combobox"
import { TeamLogo } from "@/components/admin/team-logo"
import { LeagueBadge } from "@/components/admin/league-badge"
import { adminGetFixtureOptions, adminGetLocationSuggestions } from "@/actions/admin-data"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/components/auth-provider"
import { AdminPageHeader } from "@/components/admin/admin-page-header"

// Matches the rest of the app's convention for "our team" and "current season".
const OUR_TEAM_ID = 1
const CURRENT_LEAGUE_ID = 4
const NEW_LEAGUE_VALUE = "__new__"

interface TeamOption {
  id: number
  name: string
  logo_url: string | null
}

interface LeagueOption {
  id: number
  name: string
  season: string
  year: number
}

export default function CreateFixture() {
  const router = useRouter()
  const { userRole } = useAuth()
  const { toast } = useToast()
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)

  const [teams, setTeams] = useState<TeamOption[]>([])
  const [leagues, setLeagues] = useState<LeagueOption[]>([])
  const [locationSuggestions, setLocationSuggestions] = useState<string[]>([])

  const [leagueId, setLeagueId] = useState(String(CURRENT_LEAGUE_ID))
  const [week, setWeek] = useState("1")
  const [homeTeamId, setHomeTeamId] = useState(String(OUR_TEAM_ID))
  const [awayTeamId, setAwayTeamId] = useState("")
  const [matchDate, setMatchDate] = useState("")
  const [matchTime, setMatchTime] = useState("14:00")
  const [location, setLocation] = useState("")

  // New-league mini form
  const [isAddingLeague, setIsAddingLeague] = useState(false)
  const [isCreatingLeague, setIsCreatingLeague] = useState(false)
  const [newLeague, setNewLeague] = useState({
    name: "",
    season: "Høst",
    type: "regular",
    year: String(new Date().getFullYear()),
  })

  useEffect(() => {
    if (userRole !== "admin") {
      router.push("/login")
      return
    }
    setIsAuthorized(true)

    async function fetchData() {
      setIsLoading(true)
      try {
        const [options, locations] = await Promise.all([adminGetFixtureOptions(), adminGetLocationSuggestions()])

        if (options.error) console.error(options.error)
        setTeams(options.teams)
        setLeagues(options.leagues)
        setLocationSuggestions(locations)
      } catch (error) {
        console.error("Error:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router])

  const handleSwapTeams = () => {
    setHomeTeamId(awayTeamId)
    setAwayTeamId(homeTeamId)
  }

  const handleLeagueSelectChange = (value: string) => {
    if (value === NEW_LEAGUE_VALUE) {
      setIsAddingLeague(true)
      return
    }
    setLeagueId(value)
  }

  const handleCreateLeague = async () => {
    if (!newLeague.name || !newLeague.season || !newLeague.type || !newLeague.year) {
      toast({ title: "Fill in all league fields first", variant: "destructive" })
      return
    }

    setIsCreatingLeague(true)
    try {
      const response = await fetch("/api/leagues", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newLeague.name,
          season: newLeague.season,
          type: newLeague.type,
          year: Number.parseInt(newLeague.year),
        }),
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(data.error || "Failed to create league")
      }

      const created: LeagueOption = {
        id: data.id,
        name: newLeague.name,
        season: newLeague.season,
        year: Number.parseInt(newLeague.year),
      }
      setLeagues((prev) => [created, ...prev])
      setLeagueId(String(created.id))
      setIsAddingLeague(false)
      setNewLeague({ name: "", season: "Høst", type: "regular", year: String(new Date().getFullYear()) })
      toast({ title: "League added" })
    } catch (error) {
      console.error("Error creating league:", error)
      toast({
        title: "Failed to create league",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsCreatingLeague(false)
    }
  }

  const handleSubmit = async () => {
    if (!leagueId || !homeTeamId || !awayTeamId || !matchDate || !matchTime || !location) {
      toast({ title: "Fill in all fixture fields first", variant: "destructive" })
      return
    }

    if (homeTeamId === awayTeamId) {
      toast({ title: "Home and away team must be different", variant: "destructive" })
      return
    }

    setIsCreating(true)
    try {
      const response = await fetch("/api/matches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          league_id: Number.parseInt(leagueId),
          week: Number.parseInt(week) || 1,
          home_team_id: Number.parseInt(homeTeamId),
          away_team_id: Number.parseInt(awayTeamId),
          match_date: matchDate,
          match_time: matchTime,
          location,
        }),
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(data.error || "Failed to create fixture")
      }

      toast({ title: "Fixture added" })
      router.push("/admin/matches")
    } catch (error) {
      console.error("Error creating fixture:", error)
      toast({
        title: "Failed to add fixture",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsCreating(false)
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
      <main className="container mx-auto py-8 px-4">
        <AdminPageHeader title="Add Fixture" backHref="/admin/matches" backLabel="Matches" />

        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle>Fixture Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>League</Label>
              <Select value={isAddingLeague ? NEW_LEAGUE_VALUE : leagueId} onValueChange={handleLeagueSelectChange}>
                <SelectTrigger className="w-full sm:w-64">
                  <SelectValue placeholder="Select league" />
                </SelectTrigger>
                <SelectContent>
                  {leagues.map((league) => (
                    <SelectItem key={league.id} value={String(league.id)}>
                      <span className="flex items-center gap-2">
                        <LeagueBadge name={league.name} />
                        <span className="text-sm text-gray-500">{league.year}</span>
                      </span>
                    </SelectItem>
                  ))}
                  <SelectSeparator />
                  <SelectItem value={NEW_LEAGUE_VALUE} className="font-medium text-blue-600 focus:text-blue-700">
                    <span className="flex items-center gap-1.5">
                      <Plus className="h-3.5 w-3.5" />
                      Add new league...
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {isAddingLeague && (
              <Card className="bg-gray-50">
                <CardContent className="pt-4 space-y-4">
                  <p className="text-sm text-gray-600">
                    Not sure which league or sluttspill you'll end up in? Just give it a name for now — you can
                    always add more once things are settled.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="newLeagueName">Name</Label>
                      <Input
                        id="newLeagueName"
                        placeholder="e.g. Avdeling A, B-sluttspill"
                        value={newLeague.name}
                        onChange={(e) => setNewLeague((prev) => ({ ...prev, name: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newLeagueYear">Year</Label>
                      <Input
                        id="newLeagueYear"
                        type="number"
                        value={newLeague.year}
                        onChange={(e) => setNewLeague((prev) => ({ ...prev, year: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Season</Label>
                      <Select
                        value={newLeague.season}
                        onValueChange={(value) => setNewLeague((prev) => ({ ...prev, season: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Vår">Vår</SelectItem>
                          <SelectItem value="Høst">Høst</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Type</Label>
                      <Select
                        value={newLeague.type}
                        onValueChange={(value) => setNewLeague((prev) => ({ ...prev, type: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="regular">Regular</SelectItem>
                          <SelectItem value="playoff">Playoff</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      size="sm"
                      disabled={isCreatingLeague}
                      onClick={handleCreateLeague}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      {isCreatingLeague ? "Adding..." : "Add League"}
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => setIsAddingLeague(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="space-y-2">
              <Label htmlFor="week">Week</Label>
              <Input
                id="week"
                type="number"
                min="1"
                className="max-w-[120px]"
                value={week}
                onChange={(e) => setWeek(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4 items-end">
              <div className="space-y-2">
                <Label>Home Team</Label>
                <Select value={homeTeamId} onValueChange={setHomeTeamId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Home team" />
                  </SelectTrigger>
                  <SelectContent>
                    {teams.map((team) => (
                      <SelectItem key={team.id} value={String(team.id)}>
                        <span className="flex items-center gap-2">
                          <TeamLogo url={team.logo_url} name={team.name} size={18} />
                          {team.name}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                type="button"
                variant="outline"
                size="icon"
                className="mb-0.5"
                onClick={handleSwapTeams}
                disabled={!homeTeamId && !awayTeamId}
                aria-label="Swap home and away"
              >
                <ArrowLeftRight className="h-4 w-4" />
              </Button>

              <div className="space-y-2">
                <Label>Away Team</Label>
                <Select value={awayTeamId} onValueChange={setAwayTeamId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Away team" />
                  </SelectTrigger>
                  <SelectContent>
                    {teams.map((team) => (
                      <SelectItem key={team.id} value={String(team.id)}>
                        <span className="flex items-center gap-2">
                          <TeamLogo url={team.logo_url} name={team.name} size={18} />
                          {team.name}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <div className="space-y-2">
                <Label htmlFor="matchTime">Time</Label>
                <Input
                  id="matchTime"
                  type="time"
                  className="date-icon-left"
                  value={matchTime}
                  onChange={(e) => setMatchTime(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Location</Label>
              <LocationCombobox value={location} onChange={setLocation} options={locationSuggestions} />
            </div>

            <div className="pt-4 flex justify-center">
              <Button disabled={isCreating} onClick={handleSubmit} className="bg-black">
                <CalendarPlus className="h-4 w-4 mr-2" />
                {isCreating ? "Adding..." : "Add Fixture"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
