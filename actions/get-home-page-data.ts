"use server"

import { getTeamStatistics } from "@/actions/get-team-statistics"
import { getLeagueById } from "@/actions/get-league-data"
import { getTopScorersByLeague } from "@/actions/get-top-scorers-by-league"
import { fetchNewsArticles } from "@/lib/get-news-articles"

// Everything the home page loads, fetched in parallel in one request. The
// browser runs server actions one at a time, so separate calls would queue up.
export async function getHomePageData() {
  const [stats, leaguesData, topScorersData, news] = await Promise.all([
    getTeamStatistics(),
    // League 4 (current season) first, then 3, 1, 2
    Promise.all([4, 3, 1, 2].map(getLeagueById)),
    getTopScorersByLeague(4),
    fetchNewsArticles().catch(() => null),
  ])
  return { stats, leagues: leaguesData, topScorers: topScorersData, news }
}
