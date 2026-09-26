"use client"

import { Fragment } from "react"
import { Calendar, Clock } from "lucide-react"

interface LineupMatchHeaderProps {
  /** From toMatchHeader; loaded by the page along with the lineup so the header never flashes. */
  match?: MatchHeader | null
  /** Shown instead when the lineup isn't linked to a match. */
  fallbackTitle?: string | null
  fallbackDate?: string | null
}

interface Team {
  id: number
  name: string
  logo_url: string | null
}

export interface MatchHeader {
  home: Team
  away: Team
  date: string | null
  time: string | null
}

/** Both teams and kickoff for a match, or null if it can't be loaded. */
export function toMatchHeader(data: unknown): MatchHeader | null {
  // The generated Supabase types don't cover the joined teams, so describe the row here.
  const row = data as unknown as {
    match_date: string | null
    match_time: string | null
    home_team: Team | null
    away_team: Team | null
  } | null
  if (!row?.home_team || !row.away_team) return null
  return { home: row.home_team, away: row.away_team, date: row.match_date, time: row.match_time }
}

// Same badge the home page's next match card uses for us.
const OUR_TEAM_ID = 1
const OUR_TEAM_LOGO = "/logos/club/htm-logo-official.png"

// "2026-09-27" as a local date, so it doesn't shift a day in other time zones.
const formatDate = (value: string) => {
  const [y, m, d] = value.split("-").map(Number)
  const date = y && m && d ? new Date(y, m - 1, d) : new Date(value)
  return isNaN(date.getTime())
    ? value
    : date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })
}

function TeamSide({ team }: { team: Team }) {
  const logo = team.id === OUR_TEAM_ID ? OUR_TEAM_LOGO : team.logo_url
  return (
    <div className="flex flex-1 flex-col items-center gap-3 min-w-0">
      {logo ? (
        <img src={logo} alt={team.name} className="h-20 w-20 object-contain drop-shadow-md sm:h-24 sm:w-24" />
      ) : (
        <span className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-200 text-lg font-bold sm:h-24 sm:w-24">
          {team.name.substring(0, 3).toUpperCase()}
        </span>
      )}
      <span className="text-center text-sm font-bold sm:text-xl">{team.name}</span>
    </div>
  )
}

/** The lineup page title: both teams with their logos, and the kickoff details. */
export function LineupMatchHeader({ match: header, fallbackTitle, fallbackDate }: LineupMatchHeaderProps) {
  if (!header) {
    return (
      <div className="mb-6 text-center">
        <h1 className="mb-4 text-4xl font-bold">{fallbackTitle || "NEXT WEEK'S LINEUP"}</h1>
        {fallbackDate && <p className="mb-4 text-xl text-gray-600">{formatDate(fallbackDate)}</p>}
      </div>
    )
  }

  // Date and kickoff time, like the home page's next match card.
  const details = [
    header.date && { icon: Calendar, text: formatDate(header.date) },
    header.time && { icon: Clock, text: header.time.slice(0, 5) },
  ].filter(Boolean) as { icon: typeof Calendar; text: string }[]

  return (
    <div className="mb-8">
      <p className="mb-5 text-center text-xs font-semibold uppercase tracking-[0.3em] text-gray-500">Matchday Lineup</p>
      <div className="mx-auto flex max-w-2xl items-center justify-center gap-4 sm:gap-10">
        <TeamSide team={header.home} />
        <span className="shrink-0 text-3xl font-black text-gray-300 sm:text-5xl">VS</span>
        <TeamSide team={header.away} />
      </div>
      {details.length > 0 && (
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-sm font-medium text-gray-800 sm:text-base">
          {details.map(({ icon: Icon, text }, index) => (
            <Fragment key={text}>
              {index > 0 && <div className="h-4 w-[2px] bg-gray-300" />}
              <div className="flex items-center gap-2">
                <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                <span>{text}</span>
              </div>
            </Fragment>
          ))}
        </div>
      )}
    </div>
  )
}
