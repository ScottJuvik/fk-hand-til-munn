"use server"

import { createServerSupabaseClient, publicError, requireAdmin } from "@/lib/supabase"

// Read-only data for the /admin pages. Server actions are reachable by
// anyone who knows their id, so every function checks for an admin session
// before touching the database. Writes go through the /api routes, which
// the middleware protects.

const OUR_TEAM_ID = 1

const MATCH_SELECT = `
  id,
  match_date,
  match_time,
  location,
  home_score,
  away_score,
  updated_at,
  home_team:home_team_id(id, name, short_name, logo_url),
  away_team:away_team_id(id, name, short_name, logo_url),
  league:league_id(id, name, year)
`

async function adminClient() {
  await requireAdmin()
  return createServerSupabaseClient()
}

export async function adminGetPlayers(orderBy: "id" | "name" = "id") {
  const supabase = await adminClient()
  const { data, error } = await supabase.from("players").select("*").order(orderBy === "name" ? "name" : "id")
  return { data: data ?? [], error: publicError("Loading players", error) }
}

export async function adminGetPlayer(playerId: number | string) {
  const supabase = await adminClient()
  const [player, stats] = await Promise.all([
    supabase.from("players").select("*").eq("id", Number(playerId)).maybeSingle(),
    supabase.from("player_stats").select("*").eq("player_id", Number(playerId)).maybeSingle(),
  ])
  return { player: player.data, stats: stats.data, error: publicError("Loading player", player.error) }
}

export async function adminGetLeagueStatistics(leagueId: number) {
  const supabase = await adminClient()
  const [players, stats] = await Promise.all([
    supabase.from("players").select("id, name, nickname, is_icon").order("name"),
    supabase.from("player_statistics").select("*").eq("league", Number(leagueId)),
  ])
  return {
    players: players.data ?? [],
    stats: stats.data ?? [],
    error: publicError("Loading player statistics", players.error || stats.error),
  }
}

export async function adminGetLineups() {
  const supabase = await adminClient()
  const { data, error } = await supabase
    .from("lineups")
    .select(
      "*, match:match_id(league:league_id(id, name, year), home_team:home_team_id(name, logo_url), away_team:away_team_id(name, logo_url))",
    )
    .order("match_date", { ascending: false })
  return { data: data ?? [], error: publicError("Loading lineups", error) }
}

/** A lineup with its match (teams, location) and player slots, for the edit page. */
export async function adminGetLineup(lineupId: number | string) {
  const supabase = await adminClient()
  const id = Number(lineupId)
  const [lineup, lineupPlayers] = await Promise.all([
    supabase.from("lineups").select("*").eq("id", id).maybeSingle(),
    supabase
      .from("lineup_players")
      .select("player_id, position_order, is_substitute")
      .eq("lineup_id", id)
      .order("position_order"),
  ])
  if (lineup.error || !lineup.data) {
    return { lineup: null, match: null, lineupPlayers: [], error: publicError("Loading lineup", lineup.error) }
  }

  let match = null
  if (lineup.data.match_id) {
    const { data } = await supabase
      .from("matches")
      .select("location, home_team:home_team_id(name, logo_url), away_team:away_team_id(name, logo_url)")
      .eq("id", lineup.data.match_id)
      .maybeSingle()
    match = data
  }

  return { lineup: lineup.data, match, lineupPlayers: lineupPlayers.data ?? [], error: null }
}

/** Our not-yet-played and played matches for the matches admin page. */
export async function adminGetMatches() {
  const supabase = await adminClient()
  const ourTeam = `home_team_id.eq.${OUR_TEAM_ID},away_team_id.eq.${OUR_TEAM_ID}`
  const [upcoming, previous] = await Promise.all([
    // "Upcoming" means not-yet-played rather than strictly in the future,
    // so a match reverted from Previous still shows up here.
    supabase
      .from("matches")
      .select(MATCH_SELECT)
      .eq("played", false)
      .or(ourTeam)
      .order("match_date", { ascending: true })
      .order("match_time", { ascending: true }),
    supabase.from("matches").select(MATCH_SELECT).eq("played", true).or(ourTeam).order("match_date", { ascending: false }),
  ])
  return {
    upcoming: upcoming.data ?? [],
    previous: previous.data ?? [],
    upcomingError: publicError("Loading upcoming matches", upcoming.error),
    previousError: publicError("Loading previous matches", previous.error),
  }
}

/** Teams and leagues for the create-fixture form. */
export async function adminGetFixtureOptions() {
  const supabase = await adminClient()
  const [teams, leagues] = await Promise.all([
    supabase.from("teams").select("id, name, logo_url").order("name"),
    supabase.from("leagues").select("id, name, season, year").order("year", { ascending: false }),
  ])
  return {
    teams: teams.data ?? [],
    leagues: leagues.data ?? [],
    error: publicError("Loading teams and leagues", teams.error || leagues.error),
  }
}

/** All articles, drafts included. */
export async function adminGetNewsArticles() {
  const supabase = await adminClient()
  const { data, error } = await supabase.from("news_articles").select("*").order("published_at", { ascending: false })
  return { data: data ?? [], error: publicError("Loading articles", error) }
}

export async function adminGetNewsArticle(articleId: number | string) {
  const supabase = await adminClient()
  const { data, error } = await supabase.from("news_articles").select("*").eq("id", Number(articleId)).maybeSingle()
  return { data, error: publicError("Loading article", error) }
}

/** Venues previously used for matches, most-used first, keeping the most common spelling. */
export async function adminGetLocationSuggestions() {
  const supabase = await adminClient()
  const { data, error } = await supabase.from("matches").select("location")
  if (error) {
    publicError("Loading locations", error)
    return []
  }
  const groups = new Map<string, Map<string, number>>()
  for (const row of data || []) {
    const loc = row.location as string | null
    if (!loc) continue
    const key = loc.toLowerCase()
    const variants = groups.get(key) || new Map<string, number>()
    variants.set(loc, (variants.get(loc) || 0) + 1)
    groups.set(key, variants)
  }
  return Array.from(groups.values())
    .map((variants) => {
      const [canonical] = Array.from(variants.entries()).sort((a, b) => b[1] - a[1])[0]
      const total = Array.from(variants.values()).reduce((sum, n) => sum + n, 0)
      return { canonical, total }
    })
    .sort((a, b) => b.total - a.total)
    .map((v) => v.canonical)
}
