"use server"

import { createServerSupabaseClient, publicError } from "@/lib/supabase"

// Read-only data for the public pages. These run on the server, so the
// browser only sees the result, never the query or any database key.

// Player columns shown on the lineup page.
const LINEUP_PLAYER_COLUMNS = `
  id,
  name,
  position,
  rating,
  nationality,
  club,
  shirt_number,
  weak_foot,
  skill_moves,
  attacking_work_rate,
  defensive_work_rate,
  nickname,
  alternate_positions,
  specialties,
  created_at,
  updated_at
`

const toIds = (ids: unknown[]) => ids.map(Number).filter((id) => Number.isInteger(id))

/** Leagues for the statistics dropdown, newest first. */
export async function getLeagueOptions() {
  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase
    .from("leagues")
    .select("id, name, season, year")
    .order("year", { ascending: false })
    .order("name", { ascending: true })
  return { data: data ?? [], error: publicError("Loading leagues", error) }
}

/** Current-squad players with their card images, plus their stats for one league. */
export async function getLeagueStatistics(leagueId: number) {
  const supabase = createServerSupabaseClient()
  const [players, stats] = await Promise.all([
    supabase
      .from("players")
      .select(`
        id,
        name,
        nickname,
        position,
        rating,
        player_images:player_images_player_id_fkey(
            fifa_card_url,
            playercard_url
        )
      `)
      .eq("is_icon", false)
      .order("name"),
    supabase
      .from("player_statistics")
      .select("player_id, goals, assists, matches_played, yellow_cards, red_cards, minutes_played")
      .eq("league", Number(leagueId)),
  ])
  return {
    players: players.data ?? [],
    stats: stats.data ?? [],
    error: publicError("Loading player statistics", players.error || stats.error),
  }
}

/** Everything the /players page needs. */
export async function getPlayersPageData() {
  const supabase = createServerSupabaseClient()
  const [players, stats, images] = await Promise.all([
    supabase.from("players").select("*").order("rating", { ascending: false }),
    supabase.from("player_stats").select("*"),
    supabase.from("player_images").select("player_id, playercard_url"),
  ])
  return {
    players: players.data ?? [],
    stats: stats.data ?? [],
    images: images.data ?? [],
    error: publicError("Loading players", players.error || stats.error || images.error),
  }
}

export interface PlayerStatChangeItem {
  id: number
  player_id: number
  player_name: string
  stat: string
  old_value: number
  new_value: number
  created_at: string
}

/** Player stat changes from the last 24 hours, newest first, for the ticker on /players. */
export async function getRecentStatChanges(limit = 30): Promise<PlayerStatChangeItem[]> {
  const supabase = createServerSupabaseClient()
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  const { data, error } = await supabase
    .from("player_stat_changes")
    .select("id, player_id, stat, old_value, new_value, created_at, player:player_id(name)")
    .gte("created_at", since)
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .limit(Math.min(Math.max(Math.trunc(Number(limit)) || 30, 1), 50))
  // The ticker is extra, so a failure (or the table not existing yet) just hides it.
  if (publicError("Loading player stat changes", error)) return []
  const rows = (data ?? []) as unknown as (Omit<PlayerStatChangeItem, "player_name"> & {
    player: { name: string } | null
  })[]
  return rows.map(({ player, ...change }) => ({
    ...change,
    player_name: player?.name ?? "Unknown player",
  }))
}

/** A lineup by id, or the newest active lineup when no id is given. */
export async function getLineup(lineupId?: number | string | null) {
  const supabase = createServerSupabaseClient()
  if (lineupId) {
    const { data, error } = await supabase.from("lineups").select("*").eq("id", Number(lineupId)).maybeSingle()
    return { data, error: publicError("Loading lineup", error) }
  }
  const { data, error } = await supabase
    .from("lineups")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(1)
  return { data: data?.[0] ?? null, error: publicError("Loading lineup", error) }
}

/** The newest active lineup for a match, or null if none is published. */
export async function getLineupForMatch(matchId: number | string) {
  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase
    .from("lineups")
    .select("*")
    .eq("match_id", Number(matchId))
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(1)
  return { data: data?.[0] ?? null, error: publicError("Loading lineup", error) }
}

/** The players in a lineup, with their details, card images and stats. */
/** A lineup's players, plus the match header when given its match, in one request. */
export async function getLineupPlayers(lineupId: number, matchId?: number | null) {
  const [result, header] = await Promise.all([loadLineupPlayers(lineupId), matchId ? getMatchHeader(matchId) : null])
  return { ...result, matchHeader: header?.data ?? null }
}

async function loadLineupPlayers(lineupId: number) {
  const supabase = createServerSupabaseClient()
  const { data: lineupPlayers, error } = await supabase
    .from("lineup_players")
    .select("id, position, position_order, is_substitute, player_id")
    .eq("lineup_id", Number(lineupId))
    .order("position_order")
  if (error || !lineupPlayers || lineupPlayers.length === 0) {
    return { lineupPlayers: [], players: [], images: [], stats: [], error: publicError("Loading lineup players", error) }
  }

  const playerIds = lineupPlayers.map((lp) => lp.player_id)
  const [players, images, stats] = await Promise.all([
    supabase.from("players").select(LINEUP_PLAYER_COLUMNS).in("id", playerIds),
    supabase.from("player_images").select("player_id, fifa_card_url, playercard_url").in("player_id", playerIds),
    supabase.from("player_stats").select("*").in("player_id", playerIds),
  ])
  // Missing images aren't fatal; the page falls back to placeholders.
  if (images.error) publicError("Loading player images", images.error)
  return {
    lineupPlayers,
    players: players.data ?? [],
    images: images.data ?? [],
    stats: stats.data ?? [],
    error: publicError("Loading lineup players", players.error || stats.error),
  }
}

/** Card images and stats for a set of players (lineup preview). */
export async function getPlayerCards(playerIds: number[]) {
  const ids = toIds(playerIds)
  const supabase = createServerSupabaseClient()
  const [stats, images] = await Promise.all([
    supabase.from("player_stats").select("*").in("player_id", ids),
    supabase.from("player_images").select("player_id, fifa_card_url, playercard_url").in("player_id", ids),
  ])
  return { stats: stats.data ?? [], images: images.data ?? [] }
}

/** Both teams (with logos) and kickoff for the lineup page header. */
export async function getMatchHeader(matchId: number) {
  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase
    .from("matches")
    .select(`
      match_date,
      match_time,
      home_team:home_team_id(id, name, logo_url),
      away_team:away_team_id(id, name, logo_url)
    `)
    .eq("id", Number(matchId))
    .maybeSingle()
  return { data, error: publicError("Loading match", error) }
}

/** Match info for the lineup page: from a match id, or from a lineup's match. */
export async function getMatchSummary({ matchId, lineupId }: { matchId?: number | null; lineupId?: number | null }) {
  const supabase = createServerSupabaseClient()

  let resolvedMatchId = matchId ? Number(matchId) : null
  if (!resolvedMatchId && lineupId) {
    const { data } = await supabase.from("lineups").select("match_id").eq("id", Number(lineupId)).maybeSingle()
    resolvedMatchId = data?.match_id ?? null
  }
  if (!resolvedMatchId) return { data: null, error: "No match found for this lineup" }

  const { data: match, error: matchError } = await supabase
    .from("matches")
    .select("home_team_id, away_team_id, location, match_date, match_time")
    .eq("id", resolvedMatchId)
    .maybeSingle()
  if (matchError || !match) return { data: null, error: publicError("Loading match", matchError) ?? "Match not found" }

  // Our team is always id=1, so the other side is the opponent.
  const opponentId = match.home_team_id === 1 ? match.away_team_id : match.home_team_id
  const { data: opponent, error: opponentError } = await supabase
    .from("teams")
    .select("name")
    .eq("id", opponentId)
    .maybeSingle()
  if (opponentError || !opponent) {
    return { data: null, error: publicError("Loading opponent", opponentError) ?? "Opponent not found" }
  }

  return { data: { ...match, opponent_name: opponent.name }, error: null }
}
