"use client"

import { useState, type TouchEvent, type MouseEvent } from "react"

interface SwipeProps {
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  threshold?: number
}

export function useSwipe({ onSwipeLeft, onSwipeRight, threshold = 50 }: SwipeProps) {
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)

  // Reset if swipe is abandoned
  const handleTouchStart = (e: TouchEvent | MouseEvent) => {
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX
    setTouchEnd(null)
    setTouchStart(clientX)
  }

  const handleTouchMove = (e: TouchEvent | MouseEvent) => {
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX
    setTouchEnd(clientX)
  }

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return

    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > threshold
    const isRightSwipe = distance < -threshold

    if (isLeftSwipe && onSwipeLeft) {
      onSwipeLeft()
    }

    if (isRightSwipe && onSwipeRight) {
      onSwipeRight()
    }

    // Reset values
    setTouchStart(null)
    setTouchEnd(null)
  }

  return {
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
  }
}
