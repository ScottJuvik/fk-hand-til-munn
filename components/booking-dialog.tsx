"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"

export function BookingDialog() {
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSending(true)
    setError("")

    const form = e.currentTarget
    const payload = Object.fromEntries(new FormData(form).entries())

    try {
      const response = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const result = await response.json().catch(() => ({}))

      if (!response.ok) {
        setError(result.error || "Could not send your request. Please try again.")
        return
      }

      form.reset()
      setOpen(false)
      toast({ title: "Booking request sent!", description: "Thanks! We'll get back to you by email soon." })
    } catch {
      setError("Could not send your request. Please check your connection and try again.")
    } finally {
      setIsSending(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) setError("")
      }}
    >
      <DialogTrigger asChild>
        <Button size="lg" className="bg-white text-black hover:bg-gray-200">
          Contact for Booking
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto text-black">
        <DialogHeader>
          <DialogTitle>Book Band til Munn</DialogTitle>
          <DialogDescription>
            Tell us about your event and we&apos;ll get back to you by email.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="booking-name">Name *</Label>
              <Input id="booking-name" name="name" autoComplete="name" required maxLength={255} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="booking-email">Email *</Label>
              <Input id="booking-email" name="email" type="email" autoComplete="email" required maxLength={255} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="booking-phone">Phone *</Label>
              <Input id="booking-phone" name="phone" type="tel" autoComplete="tel" required maxLength={50} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="booking-date">Event date *</Label>
              <Input id="booking-date" name="eventDate" type="date" required />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="booking-location">Venue / location *</Label>
            <Input id="booking-location" name="eventLocation" required maxLength={255} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="booking-message">About the event *</Label>
            <Textarea
              id="booking-message"
              name="message"
              rows={4}
              required
              maxLength={5000}
              placeholder="What's the occasion, how many people, how long should we play?"
            />
          </div>

          {/* Honeypot for bots; hidden from people and screen readers. */}
          <input
            type="text"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            className="absolute left-[-9999px] h-0 w-0 opacity-0"
          />

          {error && (
            <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600" role="alert">
              {error}
            </p>
          )}

          <DialogFooter className="sm:justify-center">
            <Button type="submit" disabled={isSending} className="w-full sm:w-auto">
              {isSending ? "Sending..." : "Send booking request"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
