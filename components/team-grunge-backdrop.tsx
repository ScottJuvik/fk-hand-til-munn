interface TeamGrungeBackdropProps {
  color: string
  flip?: boolean
  className?: string
}

// Colorizes the shared grunge brush-stroke asset with a team's color via a
// CSS mask, so the same PNG serves every team. For the away side, `flip`
// rotates the stroke 180deg (not a mirror) so the bright cluster moves to
// the other side while the stroke keeps leaning the same way (bottom-left
// to top-right) instead of flipping into a bottom-right-pointing "\" shape.
export function TeamGrungeBackdrop({ color, flip = false, className = "" }: TeamGrungeBackdropProps) {
  return (
    <div className={`pointer-events-none overflow-hidden ${className}`}>
      <div
        className="absolute inset-0"
        style={{ transform: flip ? "rotate(180deg)" : undefined }}
      >
        <div
          className="absolute inset-0"
          style={{
            backgroundColor: color,
            WebkitMaskImage: "url('/images/backgrounds/team-logo-backdrop.webp')",
            maskImage: "url('/images/backgrounds/team-logo-backdrop.webp')",
            WebkitMaskSize: "100% 100%",
            maskSize: "100% 100%",
            WebkitMaskRepeat: "no-repeat",
            maskRepeat: "no-repeat",
            WebkitMaskPosition: "center",
            maskPosition: "center",
            WebkitMaskMode: "luminance" as any,
            maskMode: "luminance" as any,
          }}
        />
      </div>
    </div>
  )
}
