"use client";

import type React from "react";
import { useState, useEffect, useCallback } from "react";
import { Users, Calendar, Trophy } from "lucide-react";
import { TeamStatisticsSection } from "@/components/team-statistics-section";
import { getHomePageData } from "@/actions/get-home-page-data";
import { getTopScorersByLeague } from "@/actions/get-top-scorers-by-league";
import { EnhancedLeagueCarousel } from "@/components/enhanced-league-carousel";
import { NewsCarousel } from "@/components/news-carousel";
import { UpcomingMatch } from "@/components/upcoming-match";
import type { NewsArticle } from "@/data/news";
import type { TeamStats, TopScorer } from "@/actions/get-team-statistics";
import { PartnerBanner } from "@/components/partner-banner";
import { IntroSplash } from "@/components/intro-splash";
import { ValueCard } from "@/components/value-card";
import { calculateCleanSheets } from "@/utils/calculate-clean-sheets";

export default function HomePage() {
  const [leagues, setLeagues] = useState<any[]>([]);
  const [teamStats, setTeamStats] = useState<TeamStats | null>(null);
  const [topScorers, setTopScorers] = useState<TopScorer[]>([]);
  const [activeLeague, setActiveLeague] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [newsArticles, setNewsArticles] = useState<NewsArticle[]>([]);

  // Fetch initial data
  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);

        // One request for everything (see getHomePageData)
        const data = await getHomePageData();

        setTeamStats(data.stats.teamStats);
        if (data.news) setNewsArticles(data.news);

        const leaguesData: any[] = data.leagues.filter(Boolean);
        setLeagues(leaguesData);
        // Set active league to the current season (ID 4) by default
        if (leaguesData[0]) {
          setActiveLeague(leaguesData[0].name);
        }

        // Top scorers for the current season (league 4)
        setTopScorers(data.topScorers);

        if (leaguesData.length > 0 && leaguesData[0]) {
          const currentLeagueData = leaguesData[0];

          // Update team stats with first league data
          const ourTeam = currentLeagueData.standings.find((team) =>
            team.teamName.includes("FK Hånd til Munn"),
          );

          if (ourTeam) {
            setTeamStats({
              matchesPlayed: ourTeam.played,
              wins: ourTeam.won,
              draws: ourTeam.drawn,
              losses: ourTeam.lost,
              goalsScored: ourTeam.goalsFor,
              goalsConceded: ourTeam.goalsAgainst,
              cleanSheets: calculateCleanSheets(
                currentLeagueData.matches,
                ourTeam.teamId,
              ),
              goalDifference: ourTeam.goalDifference,
            });
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        // Provide fallback data
        setTeamStats({
          matchesPlayed: 12,
          wins: 8,
          draws: 3,
          losses: 1,
          goalsScored: 28,
          goalsConceded: 10,
          cleanSheets: 5,
          goalDifference: 18,
        });
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  // Handle league change in carousel
  const handleLeagueChange = async (
    leagueName: string,
    newTeamStats: TeamStats | null,
    leagueData?: any,
  ) => {
    setActiveLeague(leagueName);
    if (newTeamStats) {
      setTeamStats(newTeamStats);
    }

    // Update top scorers based on league data if available
    if (leagueData && leagueData.id) {
      try {
        const leagueTopScorers = await getTopScorersByLeague(leagueData.id);
        setTopScorers(leagueTopScorers);
      } catch (error) {
        console.error("Error fetching top scorers for league:", error);
      }
    }
  };

  // Smooth scroll to stats
  const handleScroll = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const target = document.querySelector("#team-stats");
    if (target) {
      // Stop 40px above the section
      const top = target.getBoundingClientRect().top + window.scrollY - 40;
      window.scrollTo({ top, behavior: "smooth" });
    }
  }, []);

  return (
    <>
      <IntroSplash ready={!isLoading} />
      <div className="flex flex-col min-h-screen">
        {/* Hero Section - Full Screen Team Photo */}
        {/* On desktop, cap height at the image's aspect ratio so tall windows
            shorten the hero instead of cropping the players at the edges */}
        <section className="relative h-screen w-full md:h-[min(100vh,56.25vw)] md:[@media(max-aspect-ratio:17/10)]:h-[min(100vh,62.5vw)]">
          <div className="absolute inset-0 bg-black">
            {/* 16:10 image for taller screens (MacBooks, portrait), 16:9 otherwise */}
            <picture>
              <source
                media="(max-aspect-ratio: 17/10)"
                srcSet="/images/home/hero-16x10.webp"
              />
              <img
                src="/images/home/hero-16x9.webp"
                alt="FK Hånd til Munn Team"
                fetchPriority="high"
                className="w-full h-full object-cover object-center"
              />
            </picture>
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/40 to-black" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
          </div>
          <div className="relative h-full flex flex-col items-center justify-center text-white text-center px-4">
            <div className="mb-6 bg-white rounded-full p-1 inline-block">
              <img
                src="/logos/club/htm-logo.jpg"
                alt="FK Hånd til Munn Logo"
                className="h-24 w-24 rounded-full object-cover"
              />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-4 text-[#D4AF37]">
              FK HÅND TIL GULL
            </h1>
            <p className="text-xl mb-8 max-w-2xl">Burans greatest pride</p>

            {/* Scroll down button: right under the tagline on phones (the bottom of the
                screen can sit behind the browser's toolbar), pinned near the bottom on desktop */}
            <a
              href="#team-stats"
              onClick={handleScroll}
              className="flex flex-col items-center text-white font-medium text-lg tracking-wider hover:opacity-50 transition md:absolute md:bottom-32 md:left-1/2 md:-translate-x-1/2"
            >
              <span className="block w-6 h-6 border-l border-b border-white transform -rotate-45 animate-[sdb05_1.5s_infinite] mb-8" />
              <span className="text-sm">Scroll</span>
            </a>
          </div>

          {/* Animations */}
          <style jsx>{`
            @keyframes sdb05 {
              0% {
                transform: rotate(-45deg) translate(0, 0);
                opacity: 0;
              }
              50% {
                opacity: 1;
              }
              100% {
                transform: rotate(-45deg) translate(-20px, 20px);
                opacity: 0;
              }
            }
          `}</style>
        </section>

        {/* Team Stats Section */}
        {teamStats && (
          <section id="team-stats">
            <TeamStatisticsSection
              teamStats={teamStats}
              topScorers={topScorers}
              leagueName={activeLeague || undefined}
            />
          </section>
        )}

        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">
              UPCOMING MATCH
            </h2>
            <UpcomingMatch teamId={1} />
          </div>
        </section>

        {/* League Tables Section */}
        <section className="py-16 bg-gray-100">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">
              LEAGUE TABLES
            </h2>

            {leagues.length > 0 && (
              <EnhancedLeagueCarousel
                leagues={leagues}
                ourTeam="FK Hånd til Munn"
                onLeagueChange={handleLeagueChange}
              />
            )}
          </div>
        </section>

        {/* News Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <NewsCarousel articles={newsArticles} />
          </div>
        </section>

        {/* Values Section */}
        <section id="about" className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="flex items-center justify-center gap-8 text-3xl font-bold text-center mb-12">
              <span className="h-[2px] w-[26px] bg-black/80" />
              OUR VALUES
              <span className="h-[2px] w-[26px] bg-black/80" />
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <ValueCard
                href="/about"
                icon={<Trophy className="h-8 w-8 text-black" />}
                title="VOLD"
                description="We bring intensity and power everywhere we go."
                backgroundImage="/images/values/vold.webp"
              />
              <ValueCard
                href="/about"
                icon={<Users className="h-8 w-8 text-black" />}
                title="VILJE"
                description="Our determination and willpower drive us to succeed."
                backgroundImage="/images/values/vilje.webp"
              />
              <ValueCard
                href="/about"
                icon={<Calendar className="h-8 w-8 text-black" />}
                title="VASELIN"
                description="We play with smoothness and finesse on and off the field."
                backgroundImage="/images/values/vaselin.webp"
              />
            </div>
          </div>
        </section>

        {/* Sponsor Section */}
        <PartnerBanner
          eyebrow="Official Partner"
          sponsorName="Club Tempo"
          sponsorUrl="https://clubtempo.no/"
          quote="We are proud to introduce Tempo as the new official sponsor of HTM."
          primaryButton={{
            label: "Learn more about Club Tempo",
            href: "https://clubtempo.no/",
          }}
          backgroundColor="linear-gradient(to bottom, #0F271C, #000000)"
          titleColor="#e8dcc9"
          primaryButtonColor="#D4AF37"
        />
      </div>
    </>
  );
}
