"use client"

import { Fragment, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Trash2, Plus, Eye, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { LoadingSpinner } from "@/components/loading-spinner"
import { LeagueBadge, LeagueDivider } from "@/components/admin/league-badge"
import { Matchup } from "@/components/admin/matchup"
import { adminGetLineups } from "@/actions/admin-data"
import { useToast } from "@/hooks/use-toast"
import type { Lineup } from "@/types/supabase"
import { useAuth } from "@/components/auth-provider"
import { AdminPageHeader } from "@/components/admin/admin-page-header"

type TeamRef = { name: string; logo_url: string | null } | null
type LineupRow = Lineup & {
  match: { league: { id: number; name: string; year: number | null } | null; home_team: TeamRef; away_team: TeamRef } | null
}

export default function ManageLineups() {
  const router = useRouter()
  const { userRole } = useAuth()
  const { toast } = useToast()
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [lineups, setLineups] = useState<LineupRow[]>([])
  const [activatingId, setActivatingId] = useState<number | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [lineupToDelete, setLineupToDelete] = useState<number | null>(null)

  useEffect(() => {
    // Check if user is admin
    if (userRole !== "admin") {
      router.push("/login")
      return
    }
    setIsAuthorized(true)

    async function fetchLineups() {
      setIsLoading(true)
      try {
        const { data, error } = await adminGetLineups()

        if (error) {
          console.error("Error fetching lineups:", error)
          return
        }

        setLineups((data as unknown as LineupRow[]) || [])
      } catch (error) {
        console.error("Error:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchLineups()
  }, [router])

  const handleSetActive = async (lineupId: number) => {
    setActivatingId(lineupId)
    try {
      const response = await fetch(`/api/lineups/${lineupId}/activate`, { method: "POST" })

      if (!response.ok) {
        throw new Error("Failed to set active lineup")
      }

      setLineups(lineups.map((lineup) => ({ ...lineup, is_active: lineup.id === lineupId })))
      toast({ title: "Active lineup updated" })
    } catch (error) {
      console.error("Error setting active lineup:", error)
      toast({ title: "Failed to update active lineup", description: "Please try again.", variant: "destructive" })
    } finally {
      setActivatingId(null)
    }
  }

  const handleDeleteClick = (lineupId: number) => {
    setLineupToDelete(lineupId)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (lineupToDelete === null) return

    try {
      const response = await fetch(`/api/lineups/${lineupToDelete}`, { method: "DELETE" })

      if (!response.ok) {
        throw new Error("Failed to delete lineup")
      }

      setLineups(lineups.filter((lineup) => lineup.id !== lineupToDelete))
      toast({ title: "Lineup deleted" })
    } catch (error) {
      console.error("Error deleting lineup:", error)
      toast({ title: "Failed to delete lineup", description: "Please try again.", variant: "destructive" })
    } finally {
      setDeleteDialogOpen(false)
      setLineupToDelete(null)
    }
  }

  if (isLoading) {
    return <LoadingSpinner label="Loading lineups" />
  }

  if (!isAuthorized) {
    return null // Router will redirect
  }

  // Shared by the desktop table and the phone cards.
  const openLineup = (id: number) => router.push(`/admin/lineups/edit/${id}`)

  const renderStatus = (lineup: (typeof lineups)[number]) =>
    lineup.is_active ? (
      <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
        <Star className="h-3 w-3 fill-green-600 text-green-600" />
        Active
      </span>
    ) : (
      <Button
        variant="ghost"
        size="sm"
        className="text-gray-500"
        disabled={activatingId === lineup.id}
        onClick={(e) => {
          e.stopPropagation()
          handleSetActive(lineup.id)
        }}
      >
        <Star className="h-4 w-4 mr-1" />
        Make Active
      </Button>
    )

  const renderActions = (lineup: (typeof lineups)[number]) => (
    <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
      <Button variant="outline" size="icon" asChild>
        <Link href={`/lineup?id=${lineup.id}`}>
          <Eye className="h-4 w-4" />
        </Link>
      </Button>
      <Button variant="destructive" size="icon" onClick={() => handleDeleteClick(lineup.id)}>
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  )

  // A league divider goes above the first lineup of each league.
  const startsLeague = (index: number) =>
    index === 0 || lineups[index - 1].match?.league?.id !== lineups[index].match?.league?.id

  const leagueLabel = (lineup: (typeof lineups)[number]) =>
    lineup.match?.league ? (
      <LeagueDivider name={lineup.match.league.name} year={lineup.match.league.year} first />
    ) : (
      <span className="text-sm font-medium text-gray-500">No match linked</span>
    )

  return (
    <div className="min-h-screen bg-gray-100">

      <main className="container mx-auto py-8 px-4">
        <AdminPageHeader
          title="Manage Lineups"
          backHref="/admin/dashboard"
          backLabel="Dashboard"
          action={
            <Button asChild>
              <Link href="/admin/lineups/create">
                <Plus className="h-4 w-4 mr-2" />
                Create Lineup
              </Link>
            </Button>
          }
        />

        {/* Phones: one card per lineup, teams stacked, so nothing scrolls sideways. */}
        <div className="md:hidden space-y-3">
          {lineups.map((lineup, index) => (
            <Fragment key={lineup.id}>
              {startsLeague(index) && <div className={index === 0 ? "" : "pt-4"}>{leagueLabel(lineup)}</div>}
              <div
                onClick={() => openLineup(lineup.id)}
                className="cursor-pointer rounded-lg bg-white p-4 shadow active:bg-gray-50"
              >
                {lineup.match?.home_team && lineup.match?.away_team ? (
                  <Matchup
                    homeName={lineup.match.home_team.name}
                    homeLogo={lineup.match.home_team.logo_url}
                    awayName={lineup.match.away_team.name}
                    awayLogo={lineup.match.away_team.logo_url}
                    size={24}
                    stacked
                  />
                ) : (
                  <span className="font-semibold">{lineup.name}</span>
                )}
                <div className="mt-3 flex items-center justify-between gap-2 text-sm text-gray-500">
                  <span>
                    {lineup.formation}
                    {lineup.match_date && ` · ${new Date(lineup.match_date).toLocaleDateString()}`}
                  </span>
                  {renderStatus(lineup)}
                </div>
                <div className="mt-3 border-t pt-3">{renderActions(lineup)}</div>
              </div>
            </Fragment>
          ))}
        </div>

        <div className="hidden md:block bg-white rounded-lg shadow overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Match</TableHead>
                <TableHead className="text-center">League</TableHead>
                <TableHead className="text-center">Formation</TableHead>
                <TableHead className="text-center">Date</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lineups.map((lineup, index) => (
                <Fragment key={lineup.id}>
                {startsLeague(index) && (
                  <TableRow className="hover:bg-transparent">
                    <TableCell colSpan={7} className={index === 0 ? "pt-4" : "pt-8"}>
                      {leagueLabel(lineup)}
                    </TableCell>
                  </TableRow>
                )}
                <TableRow
                  // The whole row opens the editor; buttons inside stop the click.
                  onClick={() => openLineup(lineup.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && e.target === e.currentTarget) openLineup(lineup.id)
                  }}
                  tabIndex={0}
                  aria-label={`Edit ${lineup.name}`}
                  className="cursor-pointer hover:bg-gray-50 focus-visible:outline-none focus-visible:bg-gray-100"
                >
                  <TableCell>{lineup.id}</TableCell>
                  <TableCell>
                    {lineup.match?.home_team && lineup.match?.away_team ? (
                      <Matchup
                        homeName={lineup.match.home_team.name}
                        homeLogo={lineup.match.home_team.logo_url}
                        awayName={lineup.match.away_team.name}
                        awayLogo={lineup.match.away_team.logo_url}
                        size={24}
                      />
                    ) : (
                      <span className="font-medium">{lineup.name}</span>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    {lineup.match?.league ? (
                      <LeagueBadge name={lineup.match.league.name} />
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-center">{lineup.formation}</TableCell>
                  <TableCell className="text-center">{lineup.match_date ? new Date(lineup.match_date).toLocaleDateString() : "—"}</TableCell>
                  <TableCell className="text-center">{renderStatus(lineup)}</TableCell>
                  <TableCell className="text-right">{renderActions(lineup)}</TableCell>
                </TableRow>
                </Fragment>
              ))}
            </TableBody>
          </Table>
        </div>
      </main>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this lineup? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
