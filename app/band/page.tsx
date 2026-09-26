import Image from "next/image"
import { Music, Calendar, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import BandMemberCard from "@/components/band-member-card"
import UpcomingShows from "@/components/upcoming-shows"
import { getBandMembers } from "@/actions/get-band-members"
import { getBandShows } from "@/actions/get-band-shows"
import { BookingDialog } from "@/components/booking-dialog"
import SoundWaveSvg from "@/components/sound-wave-svg"
import { SmoothScrollLink } from "@/components/smooth-scroll-link"

export const metadata = {
  title: "Band til Munn | Official Band Page",
  description:
    "The official page of Band til Munn, the musical side project of FK Hånd til Munn football team.",
}

export default async function BandPage() {
  const [bandMembers, upcomingShows] = await Promise.all([getBandMembers(), getBandShows()])

  // Convert Dropbox link to direct download link for streaming
  const dropboxStreamUrl =
    "https://www.dropbox.com/scl/fi/mf31gpkdnp9q1wihqwddc/h-ndtilmunn.m4a?rlkey=1tjrxj2eftkcb1vro218fsfc1&st=fs9tecny&dl=1"

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent z-10" />
        {/* Add horizontal black fade at the bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black to-transparent z-10" />
        <Image
          src="/images/band/band-splash.webp"
          alt="Band til Munn performing live at an indoor concert"
          fill
          className="object-cover object-center"
          priority
          sizes="100vw"
        />
        <div className="container relative z-20 text-white">
          <h1 className="text-5xl md:text-7xl font-bold mb-4">BAND TIL MUNN</h1>
          <p className="text-xl md:text-2xl mb-8 max-w-2xl">
            From the football pitch to the stage - the musical side of FK Hånd til Munn
          </p>
          <SmoothScrollLink href="#latest-single">
            <Button size="lg" className="bg-white text-black hover:bg-gray-200">
              Listen Now
            </Button>
          </SmoothScrollLink>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 bg-black text-white relative overflow-hidden min-h-[600px]">
        <SoundWaveSvg />
        <div className="container relative z-10">
          <div className="flex items-center gap-2 mb-12">
            <Music className="h-6 w-6" />
            <h2 className="text-3xl font-bold tracking-tight">About the Band</h2>
          </div>

          <div className="relative min-h-[400px]">
            <div className="absolute top-0 left-0 md:left-[10%] max-w-md">
              <p className="text-xl leading-relaxed font-light">
                <span className="text-3xl font-medium text-blue-400">F</span>
                ormed in 2021 during post-match celebrations, Band til Munn blends country with
                Norwegian folk influences.
              </p>
            </div>

            <div className="absolute bottom-0 right-0 md:right-[10%] max-w-md text-right">
              <p className="text-xl leading-relaxed font-light">
                Our songs tell stories of camaraderie, competition, and the beautiful game that
                brought us together.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Band Members Section */}
      <section className="py-16">
        <div className="container">
          <div className="flex items-center gap-2 mb-8">
            <Users className="h-6 w-6" />
            <h2 className="text-3xl font-bold">Meet the Band</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {bandMembers.map((member) => (
              <BandMemberCard key={member.id} member={member} />
            ))}
          </div>
        </div>
      </section>

      {/* Music Player Section */}
      <section
        id="latest-single"
        className="py-16 bg-black text-white scroll-mt-24"
      >
        <div className="container">
          <h2 className="text-3xl font-bold mb-8">Listen to Our Latest Single</h2>
          <div className="bg-gray-900 p-6 rounded-lg max-w-2xl mx-auto">
            <div className="flex items-center gap-4 mb-4">
              <div className="relative w-20 h-20 rounded overflow-hidden">
                <Image
                  src="/images/band/placeholder.png"
                  alt="Album cover"
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <h3 className="text-xl font-bold">Hånd til Munn</h3>
                <p className="text-gray-400">Band til Munn</p>
              </div>
            </div>

            <audio controls className="w-full mb-4">
              <source src={dropboxStreamUrl} type="audio/mp4" />
              Your browser does not support the audio element.
            </audio>

            <div className="flex justify-between text-sm text-gray-400">
              <span>Released: May 2023</span>
              <span>Duration: 3:20</span>
            </div>

            <div className="mt-4 text-center">
              <a
                href="https://www.dropbox.com/scl/fi/vfjmkiq1vljr0o4x9czop/h-ndtilmunn.m4a?rlkey=imcoqrizjd3kdkmtp05pe2a4l&dl=1"
                className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="7 10 12 15 17 10"></polyline>
                  <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
                Download Track
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Upcoming Shows Section */}
      <section className="py-16">
        <div className="container">
          <div className="flex items-center gap-2 mb-8">
            <Calendar className="h-6 w-6 shrink-0 sm:h-7 sm:w-7" />
            <h2 className="text-2xl sm:text-3xl font-bold">Band til Munn&apos;s Upcoming Shows</h2>
          </div>
          <UpcomingShows shows={upcomingShows} />
        </div>
      </section>

      {/* Contact/Booking Section */}
      <section className="py-16 bg-black text-white">
        <div className="container">
          <h2 className="text-3xl font-bold mb-8 text-center">Book Us for Your Event</h2>
          <div className="max-w-xl mx-auto text-center">
            <p className="text-lg mb-8">
              Interested in having Band til Munn perform at your event? We're available for bookings
              at venues, private events, and festivals. All our performances are free - we play for
              the love of women, beer and of course music!
            </p>
            <BookingDialog />
          </div>
        </div>
      </section>
    </main>
  )
}
