"use server"

import { unstable_noStore as noStore } from "next/cache"
import { createServerSupabaseClient } from "@/lib/supabase"
import type { Show } from "@/components/upcoming-shows"

// Shows live in the `band_shows` table; edit it to add or change gigs.
export async function getBandShows(): Promise<Show[]> {
  // Opt out of Next's fetch cache so table edits show up immediately.
  noStore()
  try {
    const supabase = createServerSupabaseClient()
    const { data, error } = await supabase
      .from("band_shows")
      .select("id, venue, show_date, show_time, location, additional_info")
      .order("show_date")
      .order("show_time")

    if (error) {
      console.error("Error fetching band shows:", error)
      return []
    }

    return (data || []).map((show) => ({
      id: show.id,
      venue: show.venue,
      // "2025-10-15" -> "October 15, 2025" (parsed as UTC so the day never shifts)
      date: new Date(`${show.show_date}T00:00:00Z`).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
        timeZone: "UTC",
      }),
      // "Oct 15", for the compact row on phones
      shortDate: new Date(`${show.show_date}T00:00:00Z`).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        timeZone: "UTC",
      }),
      time: show.show_time.slice(0, 5),
      location: show.location,
      additionalInfo: show.additional_info,
    }))
  } catch (error) {
    console.error("Error in getBandShows:", error)
    return []
  }
}
