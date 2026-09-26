"use client"

import { useEffect, useMemo, useState } from "react"
import { Particles, ParticlesProvider } from "@tsparticles/react"
import type { Engine, ISourceOptions } from "@tsparticles/engine"
import { loadSlim } from "@tsparticles/slim"

// Must be a stable reference: ParticlesProvider throws if `init` changes.
const initEngine = async (engine: Engine) => {
  await loadSlim(engine)
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false)
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)")
    setReduced(query.matches)
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches)
    query.addEventListener("change", onChange)
    return () => query.removeEventListener("change", onChange)
  }, [])
  return reduced
}

// A linked "constellation" of white dots with a few drifting footballs.
// Hovering pulls nearby links toward the cursor; clicking kicks out more balls.
export function LoginParticles() {
  const reducedMotion = usePrefersReducedMotion()

  const options = useMemo<ISourceOptions>(
    () => ({
      fullScreen: { enable: false },
      background: { color: { value: "transparent" } },
      fpsLimit: 60,
      detectRetina: true,
      interactivity: {
        // Both canvases are stacked, so listen on the window rather than
        // the canvas or the top one would swallow all mouse events.
        detectsOn: "window",
        events: {
          onHover: { enable: !reducedMotion, mode: "grab" },
          onClick: { enable: !reducedMotion, mode: "push" },
          resize: { enable: true },
        },
        modes: {
          grab: { distance: 160, links: { opacity: 0.5 } },
          push: { quantity: 2 },
        },
      },
      particles: {
        number: { value: 60, density: { enable: true } },
        color: { value: "#ffffff" },
        opacity: { value: { min: 0.2, max: 0.6 } },
        size: { value: { min: 1, max: 3 } },
        links: {
          enable: true,
          distance: 140,
          color: "#ffffff",
          opacity: 0.15,
          width: 1,
        },
        move: {
          enable: !reducedMotion,
          speed: 0.6,
          direction: "none",
          outModes: { default: "out" },
        },
      },
      responsive: [
        {
          maxWidth: 640,
          options: { particles: { number: { value: 30 } } },
        },
      ],
    }),
    [reducedMotion],
  )

  // Footballs as a second layer, larger and slowly spinning.
  const ballOptions = useMemo<ISourceOptions>(
    () => ({
      fullScreen: { enable: false },
      background: { color: { value: "transparent" } },
      fpsLimit: 60,
      detectRetina: true,
      interactivity: {
        // Both canvases are stacked, so listen on the window rather than
        // the canvas or the top one would swallow all mouse events.
        detectsOn: "window",
        events: {
          onHover: { enable: !reducedMotion, mode: "repulse" },
          onClick: { enable: !reducedMotion, mode: "push" },
          resize: { enable: true },
        },
        modes: {
          repulse: { distance: 120, duration: 0.4 },
          push: { quantity: 1 },
        },
      },
      particles: {
        number: { value: 8, density: { enable: true } },
        shape: { type: "emoji", options: { emoji: { value: "⚽" } } },
        opacity: { value: 0.85 },
        size: { value: { min: 10, max: 18 } },
        rotate: {
          value: { min: 0, max: 360 },
          animation: { enable: !reducedMotion, speed: 6 },
        },
        move: {
          enable: !reducedMotion,
          speed: 1,
          direction: "none",
          outModes: { default: "bounce" },
        },
      },
      responsive: [
        {
          maxWidth: 640,
          options: { particles: { number: { value: 4 } } },
        },
      ],
    }),
    [reducedMotion],
  )

  return (
    <ParticlesProvider init={initEngine}>
      <Particles id="login-links" options={options} className="pointer-events-none absolute inset-0" />
      <Particles id="login-balls" options={ballOptions} className="pointer-events-none absolute inset-0" />
    </ParticlesProvider>
  )
}
