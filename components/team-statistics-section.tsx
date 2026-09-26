import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Trophy, Calendar, Clock, ArrowUp, ArrowDown, Minus } from "lucide-react"
import type { TeamStats, TopScorer } from "@/actions/get-team-statistics"

interface TeamStatisticsSectionProps {
  teamStats: TeamStats
  topScorers: TopScorer[]
  leagueName?: string
}

export function TeamStatisticsSection({ teamStats, topScorers, leagueName }: TeamStatisticsSectionProps) {
  return (
    <section id="stats" className="py-16 bg-black text-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-2">TEAM STATS</h2>
        {leagueName && <p className="text-center text-gray-400 mb-8">Based on {leagueName} performance</p>}

        {/* Match Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          <Card className="bg-white/10 border-none text-white">
            <CardContent className="p-6 flex flex-col items-center">
              <Calendar className="h-8 w-8 mb-2 text-gray-300" />
              <div className="text-4xl font-bold mb-2">{teamStats.matchesPlayed}</div>
              <div className="text-sm uppercase text-gray-300 text-center">Matches Played</div>
            </CardContent>
          </Card>
          <Card className="bg-white/10 border-none text-white">
            <CardContent className="p-6 flex flex-col items-center">
              <Trophy className="h-8 w-8 mb-2 text-green-400" />
              <div className="text-4xl font-bold mb-2 text-green-400">{teamStats.wins}</div>
              <div className="text-sm uppercase text-gray-300">Wins</div>
            </CardContent>
          </Card>
          <Card className="bg-white/10 border-none text-white">
            <CardContent className="p-6 flex flex-col items-center">
              <Minus className="h-8 w-8 mb-2 text-orange-400" />
              <div className="text-4xl font-bold mb-2 text-orange-400">{teamStats.draws}</div>
              <div className="text-sm uppercase text-gray-300">Draws</div>
            </CardContent>
          </Card>
          <Card className="bg-white/10 border-none text-white">
            <CardContent className="p-6 flex flex-col items-center">
              <ArrowDown className="h-8 w-8 mb-2 text-red-400" />
              <div className="text-4xl font-bold mb-2 text-red-400">{teamStats.losses}</div>
              <div className="text-sm uppercase text-gray-300">Losses</div>
            </CardContent>
          </Card>
        </div>

        {/* Goal Stats & Top Scorers */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Goal Statistics */}
          <Card className="bg-white/10 border-none text-white">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-center">Goal Statistics</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <ArrowUp className="h-5 w-5 mr-2 text-green-400" />
                    <span>Goals Scored</span>
                  </div>
                  <span className="font-bold text-green-400">{teamStats.goalsScored}</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <ArrowDown className="h-5 w-5 mr-2 text-red-400" />
                    <span>Goals Conceded</span>
                  </div>
                  <span className="font-bold text-red-400">{teamStats.goalsConceded}</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 mr-2 text-blue-400" />
                    <span>Clean Sheets</span>
                  </div>
                  <span className="font-bold text-blue-400">{teamStats.cleanSheets}</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <Trophy className="h-5 w-5 mr-2 text-yellow-400" />
                    <span>Goal Difference</span>
                  </div>
                  <span className={`font-bold ${teamStats.goalDifference > 0 ? "text-green-400" : "text-red-400"}`}>
                    {teamStats.goalDifference > 0 ? "+" : ""}
                    {teamStats.goalDifference}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Top Scorers */}
          <Card className="bg-white/10 border-none text-white">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-center">Top Scorers</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {topScorers.slice(0, 5).map((scorer, index) => (
                  <div key={scorer.id} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-6 h-6 flex items-center justify-center mr-3 font-bold">{index + 1}.</div>
                      <div className="flex items-center">
                        {/* FIX: Add flex-shrink-0 to the image container */}
                        <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center mr-3 flex-shrink-0">
                          {scorer.image_url ? (
                            <img
                              src={scorer.image_url || "/placeholder.svg"}
                              alt={scorer.name}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                          ) : (
                            <span className="text-xs">{scorer.position}</span>
                          )}
                        </div>
                        <div>
                          <div className="font-medium">
                            {scorer.nickname || scorer.name}
                          </div>
                          <div className="flex items-center text-xs text-gray-400">
                            <span className="mr-2">{scorer.position}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-center">
                        <div className="font-bold text-green-400">{scorer.goals}</div>
                        <div className="text-xs text-gray-400">Goals</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-blue-400">{scorer.assists}</div>
                        <div className="text-xs text-gray-400">Assists</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
