"use client"

import { useEffect, useState } from "react"
import { PlayerCard } from "@/components/player-card"
import { formatPlayerName } from "@/utils/format-player-name"
import { getFlagUrl } from "@/utils/flag-url"
import { getCountryCode } from "@/utils/country-code"
import type { PlayerWithStats } from "@/types/supabase"

// Plays once per browser session, like the home page intro splash.
const TOTW_REVEAL_SEEN_KEY = "htm-totw-reveal-seen"
// Closes by itself this long after it starts, if nobody clicks.
const AUTO_CLOSE_MS = 8500
const FADE_MS = 600

const GOLD = "#F3DA95"

// A FIFA style walkout for the Team of the Week card: light rays, then the
// player's flag, position and rating one at a time, then a flash and the card.
export function TotwReveal({ player }: { player: PlayerWithStats }) {
  const [visible, setVisible] = useState(() => {
    try {
      return !sessionStorage.getItem(TOTW_REVEAL_SEEN_KEY)
    } catch {
      return true
    }
  })
  const [closing, setClosing] = useState(false)

  const close = () => setClosing(true)

  useEffect(() => {
    if (!visible) return
    try {
      sessionStorage.setItem(TOTW_REVEAL_SEEN_KEY, "1")
    } catch {}
    const timeout = setTimeout(close, AUTO_CLOSE_MS)
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close()
    window.addEventListener("keydown", onKey)
    document.body.style.overflow = "hidden"
    return () => {
      clearTimeout(timeout)
      window.removeEventListener("keydown", onKey)
      document.body.style.overflow = ""
    }
  }, [visible])

  useEffect(() => {
    if (!closing) return
    const timeout = setTimeout(() => setVisible(false), FADE_MS)
    return () => clearTimeout(timeout)
  }, [closing])

  if (!visible) return null

  const displayName = player.nickname ? formatPlayerName(player.name, player.nickname) : player.name

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Team of the Week: ${displayName}`}
      onClick={close}
      className={`totw-reveal fixed inset-0 z-[100] flex cursor-pointer flex-col items-center justify-center overflow-hidden bg-black transition-opacity ${
        closing ? "opacity-0" : "opacity-100"
      }`}
      style={{ transitionDuration: `${FADE_MS}ms` }}
    >
      {/* Slowly turning gold light rays and a glow behind everything. */}
      <div className="totw-rays pointer-events-none absolute left-1/2 top-1/2 h-[180vmax] w-[180vmax]" />
      <div className="totw-glow pointer-events-none absolute left-1/2 top-1/2 h-[90vmax] w-[90vmax] rounded-full" />

      <p
        className="totw-title relative z-10 mb-6 text-center text-xs font-bold uppercase tracking-[0.5em] sm:text-sm"
        style={{ color: GOLD }}
      >
        Team of the Week
      </p>

      <div className="relative z-10 flex h-[448px] w-80 items-center md:h-[560px] justify-center">
        {/* Walkout clues, one after another, before the card. */}
        {player.nationality && (
          <img
            src={getFlagUrl(getCountryCode(player.nationality), 64)}
            alt={player.nationality}
            className="totw-clue totw-clue-1 absolute w-28 rounded-md shadow-[0_0_40px_rgba(243,218,149,0.5)]"
          />
        )}
        <span className="totw-clue totw-clue-2 absolute text-7xl font-black" style={{ color: GOLD }}>
          {player.position.toUpperCase()}
        </span>
        <span className="totw-clue totw-clue-3 absolute text-8xl font-black" style={{ color: GOLD }}>
          {player.rating}
        </span>

        <div className="totw-flash pointer-events-none absolute left-1/2 top-1/2 h-[140vmax] w-[140vmax] rounded-full" />

        {/* Bigger on larger screens. */}
        <div className="md:scale-125">
          <div className="totw-card pointer-events-none">
            <PlayerCard player={player} showDetails={false} />
          </div>
        </div>
      </div>

      <p className="totw-name relative z-10 mt-2 px-4 text-center text-2xl font-extrabold text-white sm:text-3xl">
        {displayName}
      </p>
      <p className="totw-hint relative z-10 mt-6 text-xs uppercase tracking-[0.3em] text-white/50">
        Click anywhere to continue
      </p>

      <style jsx>{`
        .totw-rays {
          background: repeating-conic-gradient(
            from 0deg,
            rgba(243, 218, 149, 0.13) 0deg 6deg,
            transparent 6deg 22deg
          );
          mask-image: radial-gradient(circle, black 0%, transparent 55%);
          -webkit-mask-image: radial-gradient(circle, black 0%, transparent 55%);
          animation: totwRaysIn 1.2s ease-out both, totwSpin 40s linear infinite;
        }
        .totw-glow {
          background: radial-gradient(circle, rgba(212, 175, 55, 0.35) 0%, transparent 60%);
          transform: translate(-50%, -50%);
          animation: totwPulse 3s ease-in-out infinite;
        }
        .totw-title {
          animation: totwTitleIn 1s 0.3s ease-out both;
        }

        .totw-clue {
          opacity: 0;
          animation: totwClue 0.9s ease-out both;
        }
        .totw-clue-1 {
          animation-delay: 1.2s;
        }
        .totw-clue-2 {
          animation-delay: 2s;
        }
        .totw-clue-3 {
          animation-delay: 2.8s;
        }

        .totw-flash {
          background: radial-gradient(circle, rgba(255, 246, 214, 0.95) 0%, rgba(243, 218, 149, 0.4) 25%, transparent 55%);
          opacity: 0;
          transform: translate(-50%, -50%) scale(0.1);
          animation: totwFlash 1.1s 3.7s ease-out both;
        }
        .totw-card {
          opacity: 0;
          animation: totwCardIn 1s 3.8s cubic-bezier(0.2, 1.4, 0.4, 1) both;
        }
        .totw-name {
          animation: totwRise 0.7s 4.5s ease-out both;
        }
        .totw-hint {
          animation: totwRise 0.7s 5.2s ease-out both;
        }

        @keyframes totwRaysIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes totwSpin {
          from {
            transform: translate(-50%, -50%) rotate(0deg);
          }
          to {
            transform: translate(-50%, -50%) rotate(360deg);
          }
        }
        @keyframes totwPulse {
          0%,
          100% {
            opacity: 0.7;
          }
          50% {
            opacity: 1;
          }
        }
        @keyframes totwTitleIn {
          from {
            opacity: 0;
            letter-spacing: 1.2em;
          }
          to {
            opacity: 1;
            letter-spacing: 0.5em;
          }
        }
        @keyframes totwClue {
          0% {
            opacity: 0;
            transform: scale(1.6);
            filter: blur(8px);
          }
          30% {
            opacity: 1;
            transform: scale(1);
            filter: blur(0);
          }
          75% {
            opacity: 1;
            transform: scale(1);
          }
          100% {
            opacity: 0;
            transform: scale(0.85);
          }
        }
        @keyframes totwFlash {
          0% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.1);
          }
          25% {
            opacity: 1;
          }
          100% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(1);
          }
        }
        @keyframes totwCardIn {
          from {
            opacity: 0;
            transform: perspective(900px) rotateY(-90deg) scale(0.6);
          }
          to {
            opacity: 1;
            transform: perspective(900px) rotateY(0deg) scale(1);
          }
        }
        @keyframes totwRise {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Without motion: no clues or spinning, just the card and name fading in. */
        @media (prefers-reduced-motion: reduce) {
          .totw-rays,
          .totw-glow,
          .totw-flash,
          .totw-clue {
            animation: none;
          }
          .totw-flash,
          .totw-clue {
            display: none;
          }
          .totw-rays {
            transform: translate(-50%, -50%);
          }
          .totw-card,
          .totw-name,
          .totw-hint,
          .totw-title {
            animation: totwRaysIn 0.4s ease-out both;
          }
        }
      `}</style>
    </div>
  )
}
