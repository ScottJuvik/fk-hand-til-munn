"use client"

import { useEffect, useState } from "react"
import { ArrowDown, ArrowUp } from "lucide-react"
import { getRecentStatChanges, type PlayerStatChangeItem } from "@/actions/public-data"
import { STAT_LABELS } from "@/lib/player-stat-changes"

// Scrolling strip at the top of /players with the rating and stat changes
// from the last 24 hours. Database triggers record every change, however
// it's made (supabase/player-stat-changes.sql). Hidden when there are none.

const SECONDS_PER_ITEM = 5
// A short list is repeated up to this many items, so it fills a wide screen.
const MIN_ITEMS = 12

// Every change is under 24 hours old, so minutes and hours are enough.
function timeAgo(iso: string) {
  const minutes = Math.floor((Date.now() - new Date(iso).getTime()) / 60_000)
  if (minutes < 1) return "just now"
  if (minutes < 60) return `${minutes}m ago`
  return `${Math.floor(minutes / 60)}h ago`
}

function TickerItem({ change }: { change: PlayerStatChangeItem }) {
  const upgrade = change.new_value > change.old_value
  const Arrow = upgrade ? ArrowUp : ArrowDown
  const diff = change.new_value - change.old_value

  // The overall rating is the headline change, so it gets a coloured pill.
  if (change.stat === "rating") {
    return (
      <div className="flex shrink-0 items-center px-4">
        <div
          className={`flex items-center gap-2.5 whitespace-nowrap rounded-full py-1 pl-1 pr-4 text-sm ring-1 ${
            upgrade ? "bg-green-500/15 ring-green-400/60" : "bg-red-500/15 ring-red-400/60"
          }`}
        >
          <span
            className={`flex h-6 w-6 items-center justify-center rounded-full text-black ${
              upgrade ? "bg-green-400" : "bg-red-400"
            }`}
          >
            <Arrow className="h-4 w-4" strokeWidth={3} aria-hidden="true" />
          </span>
          <span
            className={`text-[11px] font-bold uppercase tracking-wider ${upgrade ? "text-green-300" : "text-red-300"}`}
          >
            {upgrade ? "Overall upgrade" : "Overall downgrade"}
          </span>
          <span className="font-bold">{change.player_name}</span>
          <span className="text-base font-extrabold tabular-nums">
            <span className="text-gray-400">{change.old_value}</span> → {change.new_value}
          </span>
          <span className={`text-sm font-bold tabular-nums ${upgrade ? "text-green-400" : "text-red-400"}`}>
            {diff > 0 ? `+${diff}` : diff}
          </span>
          <span className="text-xs text-gray-400">{timeAgo(change.created_at)}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="flex shrink-0 items-center gap-2 whitespace-nowrap px-6 text-sm">
      <Arrow
        className={`h-4 w-4 ${upgrade ? "text-green-400" : "text-red-400"}`}
        strokeWidth={3}
        aria-label={upgrade ? "Upgrade" : "Downgrade"}
      />
      <span className="font-semibold">{change.player_name}</span>
      <span className="text-gray-300">{STAT_LABELS[change.stat] ?? change.stat}</span>
      <span className="tabular-nums">
        {change.old_value} → {change.new_value}
      </span>
      <span className={`text-xs font-semibold tabular-nums ${upgrade ? "text-green-400" : "text-red-400"}`}>
        {diff > 0 ? `+${diff}` : diff}
      </span>
      <span className="text-xs text-gray-500">{timeAgo(change.created_at)}</span>
    </div>
  )
}

export function StatChangeTicker() {
  const [changes, setChanges] = useState<PlayerStatChangeItem[]>([])

  useEffect(() => {
    getRecentStatChanges().then(setChanges).catch(() => setChanges([]))
  }, [])

  if (changes.length === 0) return null

  const repeats = Math.ceil(MIN_ITEMS / changes.length)
  // Only the first copy is read out, or shown when motion is reduced.
  const items = Array.from({ length: repeats }, (_, copy) => (
    <div
      key={copy}
      className={copy === 0 ? "flex items-center" : "flex items-center motion-reduce:hidden"}
      aria-hidden={copy === 0 ? undefined : true}
    >
      {changes.map((change) => (
        <TickerItem key={change.id} change={change} />
      ))}
    </div>
  ))

  return (
    <section aria-label="Player stat updates" className="flex h-11 items-stretch overflow-hidden bg-black text-white">
      <div className="z-10 flex shrink-0 items-center bg-[#D4AF37] px-4 text-xs font-bold uppercase tracking-widest text-black">
        Stat updates
      </div>
      {/* The list is rendered twice and moved by half its width, so the loop has no gap.
          Hovering pauses it; with reduced motion it doesn't move and scrolls sideways instead. */}
      <div className="group relative flex-1 overflow-hidden motion-reduce:overflow-x-auto">
        <div
          className="flex h-full w-max items-center animate-ticker group-hover:[animation-play-state:paused] motion-reduce:animate-none"
          style={{ animationDuration: `${changes.length * repeats * SECONDS_PER_ITEM}s` }}
        >
          <div className="flex items-center">{items}</div>
          <div className="flex items-center motion-reduce:hidden" aria-hidden="true">
            {items}
          </div>
        </div>
      </div>
    </section>
  )
}
