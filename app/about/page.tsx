import type { Metadata } from "next";
import { Trophy, Users, Calendar } from "lucide-react";
import { ValueCard } from "@/components/value-card";

export const metadata: Metadata = {
  title: "About Us | FK Hånd til Munn",
  description:
    "Learn about FK Hånd til Munn football club, our history, values, and mission",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[50vh] bg-black">
        <div className="absolute inset-0 opacity-60"></div>
        <div className="relative h-full flex flex-col items-center justify-center text-white text-center px-4">
          <div className="mb-6 bg-white rounded-full p-4 inline-block">
            <img
              src="/logos/club/htm-logo.jpg"
              alt="FK Hånd til Munn Logo"
              className="h-24 w-24 rounded-full object-cover"
            />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            ABOUT OUR CLUB
          </h1>
          <p className="text-xl max-w-2xl">
            The story of FK Hånd til Munn - Vold, Vilje and Vaselin
          </p>
        </div>
      </section>

      {/* Our Story Section */}
      <section id="our-story" className="pt-20 pb-8 bg-white scroll-mt-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="h-px w-12 bg-black" />
              <span className="text-sm font-semibold uppercase tracking-widest text-gray-500">
                Since 2020
              </span>
              <div className="h-px w-12 bg-black" />
            </div>
            <h2 className="text-3xl font-bold mb-8 md:mb-10 text-center">OUR STORY</h2>

            <div className="grid md:grid-cols-[1fr_180px] gap-6 md:gap-10 items-start">
              <div className="text-base leading-[1.75] md:text-[17px] md:leading-[1.85] text-gray-800 space-y-5 md:space-y-6">
                <p className="text-lg md:text-xl leading-relaxed font-medium text-gray-900">
                  FK Hånd til Munn was founded in{" "}
                  <strong className="font-semibold">2020</strong> by a group of
                  passionate friends who wanted to create a football club that
                  would represent their values both on and off the pitch. The
                  name "Hånd til Munn" (Hand to Mouth) was chosen to reflect the
                  club's humble beginnings and the determination to succeed
                  despite limited resources.
                </p>
                <p>
                  What started as casual kickabouts among mates quickly evolved
                  into a structured team competing in Studentligaen. Our first
                  official match was played on a rainy Sunday in September 2021,
                  and despite losing 3-1, the foundations of our club culture
                  were established that day: resilience, teamwork, and qualm.
                </p>
                <p>
                  Over the years, FK Hånd til Munn has grown significantly, both
                  in terms of membership and achievements. We've climbed through
                  the divisions, developed a respected reputation at Barmuda,
                  and become an integral part of the local footballing
                  community. Our first taste of real silverware came in 2023
                  with the C-sluttspill cup, but it was in{" "}
                  <strong className="font-semibold">2026</strong> that the club
                  wrote its most famous chapter yet: an entire season unbeaten
                  across every competition, crowned by winning the A-sluttspill
                  as the club's very own Invincibles.
                </p>
                <p>
                  Today, FK Hånd til Munn continues to embody the spirit of its
                  founders by keeping our collars stiff, spreading an unwavering
                  amount of qualm, fostering a sense of belonging for all
                  members, and not least playing attractive football. We may
                  have grown, but we remain true to our roots and the values
                  that make our club special.
                </p>
              </div>

              <div className="order-first md:order-none flex md:flex-col gap-3 md:gap-4">
                <div className="bg-black text-white rounded-lg p-4 md:p-6 text-center flex-1">
                  <p className="text-3xl md:text-4xl font-black">2020</p>
                  <p className="text-xs uppercase tracking-widest text-gray-300 mt-1">
                    Founded
                  </p>
                </div>
                {/* Bright gold: metallic gradient, a soft highlight, a light sweep and a gold trophy */}
                <div className="relative overflow-hidden rounded-lg p-4 md:p-6 text-center flex-1 text-[#2d2410] bg-[linear-gradient(135deg,#fff6cc_0%,#ffdd5c_35%,#f7c325_68%,#ffe68f_100%)] shadow-lg shadow-yellow-400/40 ring-1 ring-[#e0a800]/60">
                  <div className="pointer-events-none absolute -top-8 -right-8 h-24 w-24 rounded-full bg-white/50 blur-2xl" />
                  <div className="pointer-events-none absolute -bottom-10 -left-6 h-24 w-24 rounded-full bg-amber-700/30 blur-2xl" />
                  <div className="pointer-events-none absolute -inset-y-1/2 -left-1/2 w-1/3 rotate-12 bg-gradient-to-r from-transparent via-white/50 to-transparent motion-safe:animate-card-shine motion-reduce:hidden" />
                  <Trophy className="absolute top-2 right-2 h-5 w-5 fill-yellow-200 text-yellow-500 drop-shadow-[0_1px_1px_rgba(140,90,0,0.55)]" />
                  <p className="relative text-3xl md:text-4xl font-black drop-shadow-[0_1px_0_rgba(255,248,220,0.7)]">
                    2026
                  </p>
                  <p className="relative text-xs font-semibold uppercase tracking-widest text-[#5a4312] mt-1">
                    Champions
                  </p>
                </div>
              </div>
            </div>

            <blockquote className="mt-10 border-l-4 border-black bg-gray-50 py-4 px-6 italic text-xl text-gray-700 text-center">
              V V V
            </blockquote>
          </div>
        </div>
      </section>

      {/* Values Section with Timeline */}
      <section id="values" className="pt-4 pb-20 bg-white scroll-mt-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <ValueCard
              href="/about#values"
              interactive={false}
              icon={<Trophy className="h-8 w-8 text-black" />}
              title="VOLD"
              description="We bring intensity and power everywhere we go, challenging ourselves to perform at the highest level possible."
              backgroundImage="/images/values/vold.webp"
            />
            <ValueCard
              href="/about#values"
              interactive={false}
              icon={<Users className="h-8 w-8 text-black" />}
              title="VILJE"
              description="Our determination and willpower drive us to succeed on the pitch and in our daily lives, against all odds."
              backgroundImage="/images/values/vilje.webp"
            />
            <ValueCard
              href="/about#values"
              interactive={false}
              icon={<Calendar className="h-8 w-8 text-black" />}
              title="VASELIN"
              description="We play with smoothness and finesse on and off the field, valuing technical skill and creative expression."
              backgroundImage="/images/values/vaselin.webp"
            />
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12 text-center">OUR JOURNEY</h2>
          <div className="max-w-4xl mx-auto">
            <div className="relative border-l-4 border-black ml-6 pl-8 pb-12">
              {/* Timeline items */}
              <div className="mb-12 relative">
                <div className="absolute -left-14 bg-black text-white rounded-full w-10 h-10 flex items-center justify-center">
                  <span className="font-bold">1</span>
                </div>
                <h3 className="text-xl font-bold mb-2">2020: Foundation</h3>
                <p className="text-gray-600">
                  FK Hånd til Munn was founded by a group of university students
                  with a shared passion for football and women.
                </p>
              </div>

              <div className="mb-12 relative">
                <div className="absolute -left-14 bg-black text-white rounded-full w-10 h-10 flex items-center justify-center">
                  <span className="font-bold">2</span>
                </div>
                <h3 className="text-xl font-bold mb-2">2021: First Match </h3>
                <p className="text-gray-600">
                  Hand Til Munn enters the 7udentligean 5 division
                </p>
              </div>

              <div className="mb-12 relative">
                <div className="absolute -left-14 bg-black text-white rounded-full w-10 h-10 flex items-center justify-center">
                  <span className="font-bold">3</span>
                </div>
                <h3 className="text-xl font-bold mb-2">
                  2022: Division Victory
                </h3>
                <p className="text-gray-600">
                  The club collected it's first throphy, by winning the 5 tier
                  7dentligaen league.
                </p>
              </div>

              <div className="relative">
                <div className="absolute -left-14 bg-black text-white rounded-full w-10 h-10 flex items-center justify-center">
                  <span className="font-bold">4</span>
                </div>
                <h3 className="text-xl font-bold mb-2">2023: Cup Victory</h3>
                <p className="text-gray-600">
                  The club's first taste of real silverware, winning the
                  C-sluttspill cup after a near-unbeaten campaign.
                </p>
              </div>
            </div>

            <div className="relative border-l-4 border-[#f7c325] ml-6 pl-8 pb-8">
              <div className="relative">
                <div className="absolute -left-14 rounded-full w-10 h-10 flex items-center justify-center bg-[linear-gradient(135deg,#fff6cc_0%,#ffdd5c_45%,#f7c325_100%)] shadow-lg shadow-yellow-400/50 ring-4 ring-yellow-200">
                  <Trophy className="h-5 w-5 fill-yellow-200 text-yellow-600 drop-shadow-[0_1px_1px_rgba(140,90,0,0.55)]" />
                </div>
                {/* Same bright gold as the Champions box in Our Story */}
                <div className="relative overflow-hidden rounded-lg p-5 text-[#2d2410] bg-[linear-gradient(135deg,#fff6cc_0%,#ffdd5c_35%,#f7c325_68%,#ffe68f_100%)] shadow-lg shadow-yellow-400/40 ring-1 ring-[#e0a800]/60">
                  <div className="pointer-events-none absolute -top-10 -right-10 h-32 w-32 rounded-full bg-white/50 blur-2xl" />
                  <div className="pointer-events-none absolute -bottom-12 -left-8 h-32 w-32 rounded-full bg-amber-700/25 blur-2xl" />
                  <div className="pointer-events-none absolute -inset-y-1/2 -left-1/2 w-1/4 rotate-12 bg-gradient-to-r from-transparent via-white/50 to-transparent motion-safe:animate-card-shine motion-reduce:hidden" />
                  <h3 className="relative text-xl font-bold mb-2">
                    2026: Invincibles
                  </h3>
                  <p className="relative text-[#4a3710]">
                    Our greatest achievement to date: an entire season unbeaten
                    across every competition, crowned by winning the famous
                    A-sluttspill and earning HTM its first ever "Invincibles"
                    nickname.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12 text-center">OUR TEAM</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Team photos would go here - using placeholders for now */}
            <div className="bg-white rounded-lg overflow-hidden shadow-md">
              <img
                src="/images/about/htm-sving.webp"
                alt="Team photo"
                className="w-full h-64 object-cover"
              />
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2">Fans</h3>
                <p className="text-gray-600">
                  The beautiful people who make all of this possible.
                </p>
              </div>
            </div>
            <div className="bg-white rounded-lg overflow-hidden shadow-md">
              {/* Warmed up: a light sepia grade, an amber soft-light wash and a soft vignette */}
              <div className="relative h-64 overflow-hidden">
                <img
                  src="/images/about/coaching-staff.webp"
                  alt="Coaching staff"
                  className="w-full h-full object-cover object-[center_30%] [filter:sepia(0.25)_saturate(1.25)_contrast(1.05)_brightness(1.04)]"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-orange-600/40 via-amber-400/20 to-yellow-200/20 mix-blend-soft-light" />
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_55%,rgba(60,25,5,0.45)_100%)]" />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2">Coaching Staff</h3>
                <p className="text-gray-600">
                  The dedicated professionals guiding our players.
                </p>
              </div>
            </div>
            <div className="bg-white rounded-lg overflow-hidden shadow-md">
              <img
                src="/images/about/favela.webp"
                alt="Youth team"
                className="w-full h-64 object-cover"
              />
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2">Youth Academy</h3>
                <p className="text-gray-600">
                  The future stars of FK Hånd til Munn.
                </p>
              </div>
            </div>

            {/* New Team Section */}
            <div className="bg-white rounded-lg overflow-hidden shadow-md col-span-full">
              <img
                src="/images/about/team-photo.webp"
                alt="FK Hånd til Munn Team"
                className="w-full h-80 object-cover"
              />
              <div className="p-6 text-center">
                <h3 className="text-2xl font-bold mb-2">Squad</h3>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  The squad competing in the upcoming season.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
