import { NextResponse, type NextRequest } from "next/server"
import { z } from "zod"
import { createServerSupabaseClient } from "@/lib/supabase"

// Booking requests from the "Book Us for Your Event" form on /band.
// Every request is saved to `booking_requests` first, so nothing is lost if
// the email fails, then forwarded to BOOKING_EMAIL_TO via Resend.
//
// Env:
//   RESEND_API_KEY     – from https://resend.com/api-keys
//   BOOKING_EMAIL_TO   – where requests are sent
//   BOOKING_EMAIL_FROM – sender; defaults to Resend's test sender, which can
//                        only deliver to the email the Resend account is on

const bookingSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(255),
  email: z.string().trim().email("Enter a valid email").max(255),
  phone: z.string().trim().min(1, "Phone is required").max(50),
  eventDate: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Event date is required"),
  eventLocation: z.string().trim().min(1, "Venue / location is required").max(255),
  message: z.string().trim().min(1, "Tell us a bit about the event").max(5000),
  // Honeypot: hidden from people, bots tend to fill it in.
  website: z.string().optional().default(""),
})

const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!)

async function sendBookingEmail(booking: z.infer<typeof bookingSchema>) {
  const apiKey = process.env.RESEND_API_KEY
  const to = process.env.BOOKING_EMAIL_TO
  if (!apiKey || !to) {
    console.warn("Booking email not sent: RESEND_API_KEY or BOOKING_EMAIL_TO is not set")
    return false
  }

  const rows: [string, string][] = [
    ["Name", booking.name],
    ["Email", booking.email],
    ["Phone", booking.phone],
    ["Event date", booking.eventDate],
    ["Location", booking.eventLocation],
  ]
  const html = `
    <h2>New booking request for Band til Munn</h2>
    <table cellpadding="4">
      ${rows.map(([label, value]) => `<tr><td><strong>${label}</strong></td><td>${escapeHtml(value)}</td></tr>`).join("")}
    </table>
    <h3>Message</h3>
    <p style="white-space:pre-wrap">${escapeHtml(booking.message)}</p>
    <p style="color:#666">Reply to this email to answer ${escapeHtml(booking.name)} directly.</p>
  `

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.BOOKING_EMAIL_FROM || "Band til Munn <onboarding@resend.dev>",
      to: to.split(",").map((address) => address.trim()),
      reply_to: booking.email,
      subject: `Booking request from ${booking.name}`,
      html,
    }),
  })

  if (!response.ok) {
    console.error("Resend error:", response.status, await response.text())
    return false
  }
  return true
}

export async function POST(request: NextRequest) {
  const parsed = bookingSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid booking request" },
      { status: 400 },
    )
  }
  const booking = parsed.data

  // Pretend success for bots so they don't retry.
  if (booking.website) {
    return NextResponse.json({ ok: true })
  }

  const supabase = createServerSupabaseClient()
  const { data: saved, error } = await supabase
    .from("booking_requests")
    .insert({
      name: booking.name,
      email: booking.email,
      phone: booking.phone,
      event_date: booking.eventDate,
      event_location: booking.eventLocation,
      message: booking.message,
    })
    .select("id")
    .single()

  if (error) {
    console.error("Error saving booking request:", error)
    return NextResponse.json({ error: "Could not send your request. Please try again." }, { status: 500 })
  }

  const emailSent = await sendBookingEmail(booking).catch((err) => {
    console.error("Error sending booking email:", err)
    return false
  })
  if (emailSent) {
    await supabase.from("booking_requests").update({ email_sent: true }).eq("id", saved.id)
  }

  // The request is saved either way, so the visitor sees success.
  return NextResponse.json({ ok: true })
}
