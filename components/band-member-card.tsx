import Image from "next/image"
import Link from "next/link"
import type { BandMember } from "@/actions/get-band-members"

interface BandMemberCardProps {
  member: BandMember
}

export default function BandMemberCard({ member }: BandMemberCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden group">
      <div className="relative h-80">
        <Image
          src={member.playerImageSrc}
          alt={member.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <div className="p-4">
        <h3 className="text-xl font-bold">{member.name}</h3>
        <p className="text-gray-600 mb-2">{member.instrument}</p>
        <p className="text-sm mb-3">{member.bandBio}</p>
        <p className="text-xs text-gray-500">
          Position on the field: <span className="font-semibold">{member.position}</span>
        </p>
        <div className="mt-3">
          <Link href={`/players?player=${member.id}`} className="text-sm text-blue-600 hover:underline">
            View player profile
          </Link>
        </div>
      </div>
    </div>
  )
}
