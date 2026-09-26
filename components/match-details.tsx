"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { getMatchSummary } from "@/actions/public-data"
import { LoadingSpinner } from "@/components/loading-spinner"
import { Calendar, Clock, ExternalLink, MapPin, Users } from "lucide-react"
import type { ReactNode } from "react"

// Players meet this long before kickoff.
const ARRIVE_MINUTES_BEFORE = 60

// "14:00" or "14:00:00" -> "14:00"; also works out the meet-up time before it.
const shortTime = (time: string) => time.slice(0, 5)
const timeBefore = (time: string, minutes: number) => {
  const [h, m] = time.split(":").map(Number)
  if (Number.isNaN(h) || Number.isNaN(m)) return null
  const total = (((h * 60 + m - minutes) % 1440) + 1440) % 1440
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`
}

function DetailTile({ icon, label, children }: { icon: ReactNode; label: string; children: ReactNode }) {
  return (
    <div className="flex gap-3 rounded-xl bg-gray-50 p-4 ring-1 ring-black/5">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center text-gray-900">{icon}</div>
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">{label}</p>
        <div className="mt-1 space-y-0.5 text-sm text-gray-900">{children}</div>
      </div>
    </div>
  )
}

interface MatchDetailsProps {
  lineupId?: number   // optional
  matchId?: number    // optional
}

interface MatchInfo {
  opponent: string
  venue: string
  matchDate: string
  matchTime: string
}

export default function MatchDetails({ lineupId, matchId }: MatchDetailsProps) {
  const [matchInfo, setMatchInfo] = useState<MatchInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchMatchDetails = async () => {
      try {
        setLoading(true)

        const { data, error } = await getMatchSummary({ matchId, lineupId })
        if (error || !data) {
          throw new Error(error || "Match not found")
        }

        const { location, match_date, match_time, opponent_name } = data

        // Parse match_date
        let formattedDate = match_date
        let matchDateObj

        if (match_date.includes(".")) {
          // Handles DD.MM.YYYY format
          const [day, month, year] = match_date.split(".").map(Number)
          matchDateObj = new Date(year, month - 1, day)
        } else {
          // Assumes YYYY-MM-DD format
          matchDateObj = new Date(match_date)
        }

        if (matchDateObj && !isNaN(matchDateObj.getTime())) {
          const weekday = matchDateObj.toLocaleDateString("en-US", { weekday: "long" })
          const month = matchDateObj.toLocaleDateString("en-US", { month: "long" })
          const day = matchDateObj.toLocaleDateString("en-US", { day: "numeric" })
          formattedDate = `${weekday}, ${month} ${day}`
        }

        setMatchInfo({
          opponent: opponent_name,
          venue: location,
          matchDate: formattedDate,
          matchTime: match_time,
        })
      } catch (err: any) {
        console.error("MatchDetails error:", err)
        setError(err.message || "Failed to load match details")
      } finally {
        setLoading(false)
      }
    }

    fetchMatchDetails()
  }, [lineupId, matchId])

  if (loading) {
    return (
      <Card className="w-full mx-auto bg-white text-black">
        <LoadingSpinner label="Loading match details" fullScreen={false} />
      </Card>
    )
  }

  if (error || !matchInfo) {
    return (
      <Card className="w-full mx-auto bg-white text-black">
        <div className="p-6 text-center text-red-600">Error: {error}</div>
      </Card>
    )
  }

  // Google Maps link for venue
  const encodedLocation = encodeURIComponent(matchInfo.venue)
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedLocation}`

  const kickoff = matchInfo.matchTime ? shortTime(matchInfo.matchTime) : null
  const arriveBy = kickoff ? timeBefore(kickoff, ARRIVE_MINUTES_BEFORE) : null

  return (
    <Card className="w-full mx-auto bg-white text-black">
      <div className="p-6">
        <div className="mb-5 flex items-end justify-between gap-4 border-b border-gray-100 pb-4">
          <div>
            <h2 className="text-2xl font-bold">Match Details</h2>
            <p className="text-gray-500">vs {matchInfo.opponent}</p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <DetailTile icon={<Calendar className="h-5 w-5" />} label="Kickoff">
            <p className="font-semibold">{matchInfo.matchDate}</p>
            {kickoff && (
              <p className="flex items-center gap-1.5 text-gray-600">
                <Clock className="h-3.5 w-3.5" />
                {kickoff}
              </p>
            )}
          </DetailTile>

          <DetailTile icon={<MapPin className="h-5 w-5" />} label="Venue">
            <p className="font-semibold">{matchInfo.venue}</p>
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-blue-600 hover:underline"
            >
              Open in Maps
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </DetailTile>

          <DetailTile icon={<Users className="h-5 w-5" />} label="Meet-up">
            <p className="font-semibold">
              {arriveBy ? `Arrive by ${arriveBy}` : `Arrive ${ARRIVE_MINUTES_BEFORE} min before kickoff`}
            </p>
            <p className="text-gray-600">Team meeting in the locker room</p>
          </DetailTile>
        </div>
      </div>
    </Card>
  )
}
