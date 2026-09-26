import type { NewsArticle } from "@/data/news"

// The original launch articles. These were hardcoded in the frontend before
// news articles moved to the database for admin editing. They're kept here
// as a fallback so they keep showing up even before the news_articles table
// has been created/seeded in Supabase.
export const legacyNewsArticles: NewsArticle[] = [
  {
    id: "hand-to-mouth-sving",
    title: "Hand to Mouth Sving Opens at Granåsen",
    excerpt:
      "FK Hånd til Munn set the tone for the season with discipline, camping tactics, and a touch of qulam at the 2025 5-mila.",
    content: `
      <p>The new season started not on grass, but in the snow at Granåsen, where FK Hånd til Munn made its presence felt during the world championship 5-mila. The team established camp early, showing the same kind of planning usually reserved for away games.</p>

      <p>Some of the lads even came out the day before to camp outside the course, making sure the best positions were secured long before the crowds arrived. By morning, the setup looked solid and the atmosphere was already buzzing.</p>

      <p>As the race unfolded, the team kept control. Flags were in place, coffee Baileys was circulating, and support was delivered every time Adriano Solano managed to stay upright. A calcualted amount of qulam was also spread during the event, just enough to remind everyone who had claimed the best spot.</p>

      <p><strong>Assistant to the coach Jimmen</strong> summed it up afterwards:</p>
      <blockquote>"I’m satisfied with the effort. The lads stuck to the plan and executed it well. This is the standard we have to keep all season."</blockquote>

      <p>Next weekend brings new challenges, but with 5-mila successfully handled, FK Hånd til Munn looks prepared to carry this momentum forward, whether on the pitch or out in the snow.</p>
      `,
    date: "March 9, 2025",
    image: "/images/news/htm-sving.webp",
    author: "Scott Juvik",
    isFeatured: true,
  },
  {
    id: "new-player-signing",
    title: "Star Midfielder Joins FK Hånd til Munn",
    excerpt: "The club announces the signing of talented midfielder Sigmund Graff from Energi FK.",
    content: `
      <h2>HERE WE GOOOO! 🚨</h2>

      <p>FK Hånd til Munn is thrilled to announce the signing of Sigmund Graff, a talented midfielder who joins us from Energi FK. The 24-year-old has signed a two-year contract and will wear the number 69 shirt for our team.</p>

      <p>Sigmund has been a standout performer in the league for the past three seasons, registering 10 assists in 20 appearances for his previous club. His pace, technical ability, and eye for the ladies will make him a valuable addition to our team.</p>

      <p>During his unveiling at our home ground, <strong>Graff</strong> expressed his excitement about joining FK Hånd til Munn:</p>
      <blockquote>"I've always admired the way this team plays, and I'm honored to be part of this project. The ambition of the club aligns perfectly with my own goals, and I can't wait to score goals for my new team."</blockquote>

      <p><strong>Club President Goggen</strong> commented on the signing:</p>
      <blockquote>"Siggi is a player we've been tracking for some time. His goal-scoring record speaks for itself, but he also brings leadership qualities and a winning mentality that will benefit the entire squad."</blockquote>

      <p>Graff has already joined training sessions with his new teammates and could make his debut in this weekend's match. Fans are eagerly anticipating seeing their new midfielder in action, hoping he can help the team achieve its objectives for the season.</p>

      <p>This signing demonstrates FK Hånd til Munn's commitment to strengthening the squad and competing at the highest level possible in the upcoming season.</p>
    `,
    date: "August 1, 2025",
    image: "/images/news/graffen.webp",
    author: "Fabrizio Romano",
  },
  {
    id: "training-facility-upgrade",
    title: "FK HTM Moves Training Base to Dødens Dal",
    excerpt: "After a year of temporary sessions, the club has officially made Dødens Dal its permanent training ground.",
    content: `
  <p>FK Hånd til Munn has officially completed its move to Dødens Dal, cementing the new training ground as the permanent home of the club after more than a year of temporary sessions there. The decision marks an important milestone in the club’s growth and long-term planning.</p>

  <p>Since September last year, the team has been training at Dødens Dal on a provisional basis while exploring options for a permanent facility. Now, with the transition finalized, players and staff can fully settle into the grounds, which offer the space and stability needed for continued development.</p>

  <p><strong>Club captain Grilly</strong> welcomed the move during the announcement:</p>
  <blockquote>"Having a permanent base at Dødens Dal gives us consistency and a real sense of belonging. We’ve already built good memories here during the past year, and now we can focus on making it truly our home."</blockquote>

  <p>The club’s management believes the move will foster both sporting and community benefits. Establishing Dødens Dal as the club’s permanent training base is expected to improve performance, support player development, and reinforce FK Hånd til Munn’s ambitions for the future.</p>

  <p>Supporters will be invited to an open day at Dødens Dal next month, offering fans a chance to experience the new home of their club up close.</p>
    `,
    date: "August 23, 2025",
    image: "/images/news/dodensdal.webp",
    author: "Scott Juvik",
  },
]
