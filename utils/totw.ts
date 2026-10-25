// Team of the Week. Each week runs Monday 00:00 to Sunday 23:59 Norwegian time.
// To pick a new one, set the player and the Monday their week starts. The card
// shows as soon as it is deployed and ends by itself after that Sunday.
export const TEAM_OF_THE_WEEK = {
  playerId: 34, // Elliot Skovly
  weekStarting: "2026-10-26",
}

const TIME_ZONE = "Europe/Oslo"
const DAY_MS = 24 * 60 * 60 * 1000

// Oslo's UTC offset in ms at a moment (+1 h in winter, +2 h in summer).
function osloOffset(at: number) {
  const name = new Intl.DateTimeFormat("en-US", { timeZone: TIME_ZONE, timeZoneName: "longOffset" })
    .formatToParts(at)
    .find((part) => part.type === "timeZoneName")?.value
  const match = name?.match(/GMT([+-])(\d{2}):(\d{2})/)
  if (!match) return 0
  const minutes = Number(match[2]) * 60 + Number(match[3])
  return (match[1] === "-" ? -1 : 1) * minutes * 60 * 1000
}

// The moment a date ("2026-10-12") starts in Oslo.
function osloMidnight(date: string) {
  const utcMidnight = Date.parse(`${date}T00:00:00Z`)
  return utcMidnight - osloOffset(utcMidnight)
}

// When the week ends: midnight after its Sunday (i.e. the end of Sunday 23:59).
function totwEnd() {
  const nextMonday = new Date(Date.parse(`${TEAM_OF_THE_WEEK.weekStarting}T00:00:00Z`) + 7 * DAY_MS)
  return osloMidnight(nextMonday.toISOString().slice(0, 10))
}

/** Whether the player has the Team of the Week card right now. */
export function isTeamOfTheWeek(playerId: number, now = Date.now()) {
  return playerId === TEAM_OF_THE_WEEK.playerId && now < totwEnd()
}
