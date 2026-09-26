"use client"

import { useState } from "react"
import { Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { FormationView } from "@/components/formation-view"
import { LoadingSpinner } from "@/components/loading-spinner"
import { getPlayerCards } from "@/actions/public-data"
import { FORMATIONS } from "@/utils/formations"
import type { Player, PlayerWithStats } from "@/types/supabase"

interface LineupPreviewDialogProps {
  players: Player[]
  formation: string
  starters: (number | null)[]
  substituteIds: number[]
}

// Players without a player_stats row get neutral stats, same as /lineup.
const DEFAULT_STAT = 50
const STAT_KEYS = [
  "pace", "shooting", "passing", "dribbling", "defending", "physical", "acceleration",
  "sprint_speed", "positioning", "finishing", "shot_power", "long_shots", "vision",
  "crossing", "free_kick", "short_passing", "long_passing", "curve", "agility", "balance",
  "reactions", "ball_control", "composure", "interceptions", "heading_accuracy", "marking",
  "standing_tackle", "sliding_tackle", "jumping", "stamina", "strength", "aggression",
] as const

// Shows the lineup in the formation view (as on the public /lineup page
// "Formation" tab) before it is saved or published.
export function LineupPreviewDialog({ players, formation, starters, substituteIds }: LineupPreviewDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [starting, setStarting] = useState<PlayerWithStats[]>([])
  const [bench, setBench] = useState<PlayerWithStats[]>([])

  const startersFilled = starters.length > 0 && starters.every((id) => id !== null)

  const loadPreview = async () => {
    setLoading(true)
    try {
      const starterIds = starters as number[]
      const ids = [...starterIds, ...substituteIds]
      const { stats, images } = await getPlayerCards(ids)

      const slots = FORMATIONS[formation] || []
      const build = (id: number, position?: string): PlayerWithStats | null => {
        const player = players.find((p) => p.id === id)
        if (!player) return null
        const statRow: any = stats?.find((s) => s.player_id === id)
        const image = images?.find((i) => i.player_id === id)
        return {
          ...player,
          // Like /lineup: starters take the position of their slot.
          position: position ?? player.position,
          image_url: image?.fifa_card_url || image?.playercard_url || "/placeholder.svg?height=200&width=150",
          stats: Object.fromEntries(STAT_KEYS.map((k) => [k, statRow?.[k] ?? DEFAULT_STAT])) as PlayerWithStats["stats"],
        }
      }

      setStarting(starterIds.map((id, i) => build(id, slots[i])).filter((p): p is PlayerWithStats => p !== null))
      setBench(substituteIds.map((id) => build(id)).filter((p): p is PlayerWithStats => p !== null))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (next) loadPreview()
      }}
    >
      <DialogTrigger asChild>
        <Button
          variant="outline"
          disabled={!startersFilled}
          title={startersFilled ? undefined : "Fill all 11 starting positions to preview"}
        >
          <Eye className="h-4 w-4 mr-2" />
          Preview Lineup
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-5xl max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Lineup preview · {formation}</DialogTitle>
          <DialogDescription>This is how the lineup will look on the public Lineup page.</DialogDescription>
        </DialogHeader>
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <LoadingSpinner label="Loading preview" fullScreen={false} />
          </div>
        ) : (
          <div className="rounded-lg border p-6">
            <FormationView formation={formation} players={starting} substitutes={bench} />
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
