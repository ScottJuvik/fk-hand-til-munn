import type { ReactNode } from "react"
import Link from "next/link"

interface ValueCardProps {
  href: string
  icon: ReactNode
  title: string
  description: string
  backgroundImage: string
  interactive?: boolean
}

export function ValueCard({
  href,
  icon,
  title,
  description,
  backgroundImage,
  interactive = true,
}: ValueCardProps) {
  const Wrapper = interactive ? Link : "div"

  return (
    <Wrapper
      {...(interactive ? { href } : {})}
      className={`group relative flex min-h-[340px] flex-col items-center justify-center overflow-hidden rounded-2xl p-10 text-center ${
        interactive ? "transition-all duration-300 hover:-translate-y-1" : ""
      }`}
    >
      <div
        className={`absolute inset-0 bg-cover bg-center ${
          interactive ? "transition-transform duration-500 group-hover:scale-105" : ""
        }`}
        style={{ backgroundImage: `url('${backgroundImage}')` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/70 to-black/90" />
      <div
        className={`pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-white/10 ${
          interactive
            ? "transition-all duration-300 group-hover:shadow-xl group-hover:shadow-black/40 group-hover:ring-2 group-hover:ring-[#D4AF37]"
            : ""
        }`}
      />

      <div className="relative z-10 flex flex-col items-center gap-6">
        <div
          className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100"
          style={{ boxShadow: "0 8px 20px rgba(0,0,0,0.55), inset 0 2px 4px rgba(0,0,0,0.2)" }}
        >
          {icon}
        </div>

        <div className="space-y-4">
          <h3
            className="text-2xl font-semibold uppercase tracking-wide text-white md:text-3xl"
            style={{ textShadow: "0 2px 10px rgba(0,0,0,0.6)" }}
          >
            {title}
          </h3>
          <div className="mx-auto h-[3px] w-14 rounded-full bg-white" />
          <p className="mx-auto max-w-[220px] text-sm font-medium leading-relaxed text-gray-300">
            {description}
          </p>
        </div>
      </div>
    </Wrapper>
  )
}
