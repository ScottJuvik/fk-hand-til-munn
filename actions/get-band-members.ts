"use server"

import { unstable_noStore as noStore } from "next/cache"
import { createServerSupabaseClient } from "@/lib/supabase"
import type { Player } from "@/types/supabase"

export interface BandMember extends Player {
  instrument: string
  bandBio: string
  playerImageSrc: string
  fifaCardSrc: string
}

// Band line-up, instruments and bios live in the `band_members` table
// (linked to players.id with ON UPDATE CASCADE, so it survives id changes).
// Edit that table to change who plays what.
export async function getBandMembers(): Promise<BandMember[]> {
  // Opt out of Next's fetch cache so table edits show up immediately.
  noStore()
  try {
    const supabase = createServerSupabaseClient()

    const { data: roles, error: rolesError } = await supabase
      .from("band_members")
      .select("player_id, instrument, band_bio, sort_order")
      .order("sort_order")

    if (rolesError) {
      console.error("Error fetching band members:", rolesError)
      return []
    }

    if (!roles || roles.length === 0) {
      return []
    }

    const { data: players, error } = await supabase
      .from("players")
      .select(
        `
        *,
        player_images:player_images_player_id_fkey (
          playercard_url,
          fifa_card_url
        )
      `
      )
      .in(
        "id",
        roles.map((role) => role.player_id),
      )

    if (error) {
      console.error("Error fetching players:", error)
      return []
    }

    const playersById = new Map((players || []).map((player: any) => [player.id, player]))

    const bandMembers: BandMember[] = roles
      .map((role) => {
        const player: any = playersById.get(role.player_id)
        if (!player) return null

        const playerCardUrl = player.player_images?.playercard_url
        const fifaCardUrl = player.player_images?.fifa_card_url

        return {
          ...player,
          instrument: role.instrument,
          bandBio: role.band_bio,
          playerImageSrc: playerCardUrl || "/placeholder.svg?height=400&width=300",
          fifaCardSrc: fifaCardUrl || "/placeholder.svg?height=400&width=300",
        }
      })
      .filter((m): m is BandMember => m !== null)

    return bandMembers
  } catch (error) {
    console.error("Error in getBandMembers:", error)
    return []
  }
}
