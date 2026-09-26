"use client"

import { useEffect, useState } from "react"

export default function SoundWaveSvg() {
  const [offset1, setOffset1] = useState(0)
  const [offset2, setOffset2] = useState(0)
  const [offset3, setOffset3] = useState(0)
  const [offset4, setOffset4] = useState(0)

  useEffect(() => {
    const interval1 = setInterval(() => {
      setOffset1((prev) => (prev + 1) % 100)
    }, 50)

    const interval2 = setInterval(() => {
      setOffset2((prev) => (prev + 1) % 100)
    }, 70)

    const interval3 = setInterval(() => {
      setOffset3((prev) => (prev + 1) % 100)
    }, 60)

    const interval4 = setInterval(() => {
      setOffset4((prev) => (prev + 1) % 100)
    }, 80)

    return () => {
      clearInterval(interval1)
      clearInterval(interval2)
      clearInterval(interval3)
      clearInterval(interval4)
    }
  }, [])

  return (
    <div className="absolute inset-0 w-full h-full flex items-center justify-center pointer-events-none opacity-40">
      <svg viewBox="0 0 1200 400" className="w-full h-full" preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <linearGradient id="wave1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(0, 120, 255, 0)" />
            <stop offset="50%" stopColor="rgba(0, 120, 255, 0.7)" />
            <stop offset="100%" stopColor="rgba(0, 120, 255, 0)" />
          </linearGradient>
          <linearGradient id="wave2" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(255, 0, 0, 0)" />
            <stop offset="50%" stopColor="rgba(255, 0, 0, 0.7)" />
            <stop offset="100%" stopColor="rgba(255, 0, 0, 0)" />
          </linearGradient>
          <linearGradient id="wave3" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(0, 200, 80, 0)" />
            <stop offset="50%" stopColor="rgba(0, 200, 80, 0.7)" />
            <stop offset="100%" stopColor="rgba(0, 200, 80, 0)" />
          </linearGradient>
          <linearGradient id="wave4" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(147, 51, 234, 0)" /> {/* Purple color */}
            <stop offset="50%" stopColor="rgba(147, 51, 234, 0.7)" /> {/* Purple color */}
            <stop offset="100%" stopColor="rgba(147, 51, 234, 0)" /> {/* Purple color */}
          </linearGradient>
        </defs>

        {/* Horizontal line */}
        <line x1="0" y1="200" x2="1200" y2="200" stroke="rgba(255, 255, 255, 0.3)" strokeWidth="1" />

        {/* Wave 1 - Blue - Increased amplitude from 50 to 70 */}
        <path
          d={`
            M 0 200
            Q 300 ${150 - Math.sin(offset1 * 0.1) * 70} 600 200
            Q 900 ${250 + Math.sin(offset1 * 0.1) * 70} 1200 200
            L 1200 400 L 0 400 Z
          `}
          fill="url(#wave1)"
        />
        <path
          d={`
            M 0 200
            Q 300 ${250 + Math.sin(offset1 * 0.1) * 70} 600 200
            Q 900 ${150 - Math.sin(offset1 * 0.1) * 70} 1200 200
            L 1200 0 L 0 0 Z
          `}
          fill="url(#wave1)"
        />

        {/* Wave 2 - Red - Increased amplitude from 70 to 90 */}
        <path
          d={`
            M 0 200
            Q 300 ${130 - Math.sin(offset2 * 0.1) * 90} 600 200
            Q 900 ${270 + Math.sin(offset2 * 0.1) * 90} 1200 200
            L 1200 400 L 0 400 Z
          `}
          fill="url(#wave2)"
        />
        <path
          d={`
            M 0 200
            Q 300 ${270 + Math.sin(offset2 * 0.1) * 90} 600 200
            Q 900 ${130 - Math.sin(offset2 * 0.1) * 90} 1200 200
            L 1200 0 L 0 0 Z
          `}
          fill="url(#wave2)"
        />

        {/* Wave 3 - Green - Increased amplitude from 60 to 80 */}
        <path
          d={`
            M 0 200
            Q 300 ${140 - Math.sin(offset3 * 0.1) * 80} 600 200
            Q 900 ${260 + Math.sin(offset3 * 0.1) * 80} 1200 200
            L 1200 400 L 0 400 Z
          `}
          fill="url(#wave3)"
        />
        <path
          d={`
            M 0 200
            Q 300 ${260 + Math.sin(offset3 * 0.1) * 80} 600 200
            Q 900 ${140 - Math.sin(offset3 * 0.1) * 80} 1200 200
            L 1200 0 L 0 0 Z
          `}
          fill="url(#wave3)"
        />

        {/* Wave 4 - Purple (replaced Yellow) - Increased amplitude from 40 to 60 */}
        <path
          d={`
            M 0 200
            Q 300 ${160 - Math.sin(offset4 * 0.1) * 60} 600 200
            Q 900 ${240 + Math.sin(offset4 * 0.1) * 60} 1200 200
            L 1200 400 L 0 400 Z
          `}
          fill="url(#wave4)"
        />
        <path
          d={`
            M 0 200
            Q 300 ${240 + Math.sin(offset4 * 0.1) * 60} 600 200
            Q 900 ${160 - Math.sin(offset4 * 0.1) * 60} 1200 200
            L 1200 0 L 0 0 Z
          `}
          fill="url(#wave4)"
        />
      </svg>
    </div>
  )
}
