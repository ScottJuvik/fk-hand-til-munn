"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Edit, Trash2, Plus, Search, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { adminGetPlayers } from "@/actions/admin-data"
import { formatPlayerName } from "@/utils/format-player-name"
import type { Player } from "@/types/supabase"
import Loading from "./loading"
import { useIsMobile } from "@/hooks/use-mobile"
import { useAuth } from "@/components/auth-provider"
import { AdminPageHeader } from "@/components/admin/admin-page-header"

type SortKey = "id" | "name" | "position" | "rating" | "shirt_number" | "status"

// Sort positions the way they line up on the pitch, not alphabetically.
const POSITION_ORDER = ["GK", "RB", "RWB", "CB", "LB", "LWB", "CDM", "CM", "CAM", "RM", "LM", "RW", "LW", "CF", "ST"]
const positionRank = (position: string) => {
  const index = POSITION_ORDER.indexOf(position)
  return index === -1 ? POSITION_ORDER.length : index
}

// Phone-only cell tweaks: names sit a little in from the edge, numbers are
// centred under their short headers. Desktop keeps the default left alignment.
const NAME_CELL = "pl-4"
const NUMBER_CELL = "text-center sm:text-left"

const displayName = (player: Player) =>
  player.nickname ? formatPlayerName(player.name, player.nickname) : player.name

export default function ManagePlayers() {
  const router = useRouter()
  const { userRole } = useAuth()
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [players, setPlayers] = useState<Player[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [showIcons, setShowIcons] = useState(false)
  const isMobile = useIsMobile()
  const [sort, setSort] = useState<{ key: SortKey; direction: "asc" | "desc" }>({ key: "name", direction: "asc" })
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [playerToDelete, setPlayerToDelete] = useState<number | null>(null)

  useEffect(() => {
    // Check if user is admin
    if (userRole !== "admin") {
      router.push("/login")
      return
    }
    setIsAuthorized(true)

    // Fetch players from Supabase
    async function fetchPlayers() {
      setIsLoading(true)
      try {
        const { data, error } = await adminGetPlayers("id")

        if (error) {
          console.error("Error fetching players:", error)
          return
        }

        setPlayers(data || [])
      } catch (error) {
        console.error("Error:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPlayers()
  }, [router])

  const visiblePlayers = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    const filtered = players.filter((player) => {
      if (!showIcons && player.is_icon) return false
      if (!term) return true
      return (
        player.name.toLowerCase().includes(term) ||
        (player.nickname?.toLowerCase().includes(term) ?? false) ||
        player.position.toLowerCase() === term ||
        String(player.shirt_number ?? "") === term
      )
    })

    const compare = (a: Player, b: Player): number => {
      switch (sort.key) {
        case "id":
          return a.id - b.id
        case "name":
          return a.name.localeCompare(b.name, "nb")
        case "position":
          return positionRank(a.position) - positionRank(b.position) || a.position.localeCompare(b.position)
        case "rating":
          return a.rating - b.rating
        case "status":
          return Number(a.is_icon) - Number(b.is_icon)
        case "shirt_number":
          return (a.shirt_number ?? 0) - (b.shirt_number ?? 0)
      }
    }

    return [...filtered].sort((a, b) => {
      // Players without a shirt number always go last, whichever direction.
      if (sort.key === "shirt_number" && (a.shirt_number == null) !== (b.shirt_number == null)) {
        return a.shirt_number == null ? 1 : -1
      }
      const result = compare(a, b) * (sort.direction === "asc" ? 1 : -1)
      return result || a.name.localeCompare(b.name, "nb")
    })
  }, [players, searchTerm, showIcons, sort])

  const toggleSort = (key: SortKey) => {
    setSort((current) =>
      current.key === key
        ? { key, direction: current.direction === "asc" ? "desc" : "asc" }
        : // Numbers read best high-to-low first; text and position A-Z / GK-first.
          { key, direction: key === "rating" ? "desc" : "asc" },
    )
  }

  // `short` is the label on phones, where the sorted column turns blue instead of showing an arrow.
  // `phoneClass` adjusts the cell on phones (e.g. centring a number column).
  const sortableHead = (key: SortKey, label: string, short = label, hideOnPhone = false, phoneClass = "") => {
    const active = sort.key === key
    const Icon = !active ? ArrowUpDown : sort.direction === "asc" ? ArrowUp : ArrowDown
    return (
      <TableHead
        aria-sort={active ? (sort.direction === "asc" ? "ascending" : "descending") : "none"}
        className={`px-2 sm:px-4 ${hideOnPhone ? "hidden sm:table-cell" : ""} ${phoneClass}`}
      >
        <button
          type="button"
          onClick={() => toggleSort(key)}
          className={`inline-flex items-center gap-1 hover:text-gray-900 ${active ? "text-blue-500 sm:text-gray-900" : ""}`}
        >
          <span className="sm:hidden">{short}</span>
          <span className="hidden sm:inline">{label}</span>
          <Icon className={`hidden sm:block h-3.5 w-3.5 ${active ? "" : "text-gray-400"}`} />
        </button>
      </TableHead>
    )
  }

  const handleDeleteClick = (playerId: number) => {
    setPlayerToDelete(playerId)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (playerToDelete !== null) {
      try {
        const response = await fetch(`/api/players/${playerToDelete}`, { method: "DELETE" })
        if (!response.ok) {
          console.error("Error deleting player:", await response.text())
          return
        }

        // Update local state
        setPlayers(players.filter((player) => player.id !== playerToDelete))
        setDeleteDialogOpen(false)
        setPlayerToDelete(null)
      } catch (error) {
        console.error("Error:", error)
      }
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
        <AdminPageHeader
          title="Manage Players"
          backHref="/admin/dashboard"
          backLabel="Dashboard"
          action={
            <Button asChild>
              <Link href="/admin/players/create">
                <Plus className="h-4 w-4 mr-2" />
                Add Player
              </Link>
            </Button>
          }
        />

        <div className="flex flex-wrap items-center gap-4 mb-4">
          <div className="relative basis-full sm:basis-0 sm:flex-1 sm:max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder={isMobile ? "Search players..." : "Search by name, nickname, position or shirt #..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-2">
            <Checkbox id="showIcons" checked={showIcons} onCheckedChange={(checked) => setShowIcons(checked === true)} />
            <Label htmlFor="showIcons" className="font-normal cursor-pointer">
              Show icons
            </Label>
          </div>
          <span className="text-sm text-gray-500 ml-auto">
            {visiblePlayers.length} of {players.length} players
          </span>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                {sortableHead("id", "ID", "ID", true)}
                {sortableHead("name", "Name", "Name", false, NAME_CELL)}
                {sortableHead("position", "Position", "Pos")}
                {sortableHead("rating", "Rating", "OVR", false, NUMBER_CELL)}
                {sortableHead("shirt_number", "Shirt #", "#", false, NUMBER_CELL)}
                {sortableHead("status", "Status", "Status", true)}
                <TableHead className="px-2 sm:px-4 text-right">
                  <span className="sr-only sm:not-sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visiblePlayers.map((player) => (
                <TableRow
                  key={player.id}
                  // The whole row opens the editor; buttons inside stop the click.
                  onClick={() => router.push(`/admin/players/edit/${player.id}`)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && e.target === e.currentTarget) {
                      router.push(`/admin/players/edit/${player.id}`)
                    }
                  }}
                  tabIndex={0}
                  aria-label={`Edit ${player.name}`}
                  className="cursor-pointer hover:bg-gray-50 focus-visible:outline-none focus-visible:bg-gray-100"
                >
                  <TableCell className="hidden sm:table-cell">{player.id}</TableCell>
                  <TableCell className={`px-2 sm:px-4 font-medium ${NAME_CELL}`}>
                    {displayName(player)}
                    {/* Phones have no Status column, so icons are tagged here. */}
                    {player.is_icon && (
                      <span className="sm:hidden ml-1.5 inline-flex rounded-full bg-gray-200 px-1.5 py-0.5 text-[10px] font-medium text-gray-600">
                        Icon
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="px-2 sm:px-4">{player.position}</TableCell>
                  <TableCell className={`px-2 sm:px-4 ${NUMBER_CELL}`}>{player.rating}</TableCell>
                  <TableCell className={`px-2 sm:px-4 ${NUMBER_CELL}`}>
                    <span className="sm:hidden">{player.shirt_number ?? "–"}</span>
                    <span className="hidden sm:inline">{player.shirt_number ?? "N/A"}</span>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {player.is_icon ? (
                      <span className="inline-flex items-center rounded-full bg-gray-200 px-2 py-0.5 text-xs font-medium text-gray-600">
                        Icon
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                        Current Squad
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="px-2 sm:px-4 text-right">
                    <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                      {/* On phones the row itself opens the editor, so only delete is shown. */}
                      <Button variant="outline" size="icon" className="hidden sm:inline-flex" asChild>
                        <Link href={`/admin/players/edit/${player.id}`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="destructive" size="icon" onClick={() => handleDeleteClick(player.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {visiblePlayers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-gray-500 py-8">
                    No players match your search.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </main>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this player? This action cannot be undone.
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
