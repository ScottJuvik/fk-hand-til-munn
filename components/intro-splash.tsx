"use client";

import { useEffect, useLayoutEffect, useMemo, useState, type CSSProperties } from "react";
import { INTRO_SEEN_KEY } from "@/lib/intro-seen";

const GOLD = "#D4AF37";
const MIN_DURATION = 2600;
const FADE_DURATION = 800;

const CONFETTI_COLORS = ["#D4AF37", "#F2D879", "#FFFFFF", "#1A1A1A"];
const CONFETTI_COUNT = 70;

type ConfettiPiece = {
  id: number;
  left: number;
  delay: number;
  duration: number;
  rotation: number;
  size: number;
  color: string;
  drift: number;
  round: boolean;
};

function makeConfetti(): ConfettiPiece[] {
  return Array.from({ length: CONFETTI_COUNT }, (_, id) => ({
    id,
    left: Math.random() * 100,
    delay: Math.random() * 0.7,
    duration: 2.4 + Math.random() * 1.6,
    rotation: 360 + Math.random() * 720,
    size: 6 + Math.random() * 7,
    color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
    drift: (Math.random() - 0.5) * 160,
    round: Math.random() > 0.5,
  }));
}

export function IntroSplash({ ready = true, onFinish }: { ready?: boolean; onFinish?: () => void }) {
  const [minDurationElapsed, setMinDurationElapsed] = useState(false);
  const [fadingOut, setFadingOut] = useState(false);
  const [mounted, setMounted] = useState(true);
  const confetti = useMemo(makeConfetti, []);

  // Already played this session: skip it (before paint, so it never shows).
  useLayoutEffect(() => {
    try {
      if (sessionStorage.getItem(INTRO_SEEN_KEY)) setMounted(false);
    } catch {}
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setMinDurationElapsed(true), MIN_DURATION);
    return () => clearTimeout(t);
  }, []);

  // Only starts fading once the minimum animation time has played AND the
  // real page content is ready, so the splash never drops away onto a
  // spinner or half-loaded page.
  useEffect(() => {
    if (minDurationElapsed && ready) setFadingOut(true);
  }, [minDurationElapsed, ready]);

  useEffect(() => {
    if (!fadingOut) return;
    try {
      sessionStorage.setItem(INTRO_SEEN_KEY, "1");
    } catch {}
    const t = setTimeout(() => setMounted(false), FADE_DURATION);
    return () => clearTimeout(t);
  }, [fadingOut]);

  // Tells the page once the splash is gone, or skipped because it already played.
  useEffect(() => {
    if (!mounted) onFinish?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted]);

  useEffect(() => {
    document.body.style.overflow = mounted ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mounted]);

  if (!mounted) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] flex [html[data-intro-seen]_&]:hidden items-center justify-center bg-black transition-opacity ease-in-out ${
        fadingOut ? "opacity-0" : "opacity-100"
      }`}
      style={{ transitionDuration: `${FADE_DURATION}ms` }}
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {confetti.map((c) => (
          <span
            key={c.id}
            className={`confetti-piece absolute top-[-8%] ${c.round ? "rounded-full" : "rounded-sm"}`}
            style={
              {
                left: `${c.left}%`,
                width: c.size,
                height: c.round ? c.size : c.size * 0.45,
                backgroundColor: c.color,
                animationDelay: `${c.delay}s`,
                animationDuration: `${c.duration}s`,
                "--rotate": `${c.rotation}deg`,
                "--drift": `${c.drift}px`,
              } as CSSProperties
            }
          />
        ))}
      </div>

      <div className="firework-flash pointer-events-none absolute left-1/2 top-1/2 h-[60vmax] w-[60vmax] -translate-x-1/2 -translate-y-1/2 rounded-full" />

      <div className="animate-intro-in relative z-10 px-4 text-center">
        <p className="text-3xl font-bold uppercase tracking-[0.25em] text-white md:text-5xl">
          Seriemestere
        </p>
        <p
          className="mt-4 text-4xl font-extrabold tracking-[0.15em] md:text-6xl"
          style={{ color: GOLD }}
        >
          2025/2026
        </p>
      </div>

      <style jsx>{`
        @keyframes introIn {
          from {
            opacity: 0;
            transform: scale(0.92);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-intro-in {
          animation: introIn 0.8s ease-out both;
        }

        @keyframes confettiFall {
          0% {
            transform: translateY(0) translateX(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(115vh) translateX(var(--drift))
              rotate(var(--rotate));
            opacity: 0.85;
          }
        }
        .confetti-piece {
          animation-name: confettiFall;
          animation-timing-function: cubic-bezier(0.25, 0.1, 0.25, 1);
          animation-fill-mode: forwards;
        }

        @keyframes fireworkFlash {
          0% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.2);
          }
          20% {
            opacity: 0.38;
          }
          70% {
            opacity: 0.3;
            transform: translate(-50%, -50%) scale(1);
          }
          100% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(1.08);
          }
        }
        .firework-flash {
          background: radial-gradient(
            circle,
            rgba(212, 175, 55, 0.55) 0%,
            rgba(212, 175, 55, 0) 65%
          );
          animation: fireworkFlash 3.4s ease-out both;
        }
      `}</style>
    </div>
  );
}
