import { NextRequest, NextResponse } from "next/server"
import { acquireNotificationEvent, markNotificationEventFailed, markNotificationEventSent } from "@/lib/notifications/events"
import { sendEmail } from "@/lib/notifications/mailer"
import { buildReservationCreatedTemplate } from "@/lib/notifications/templates"
import { createServiceClient } from "@/lib/supabase/service"

export const runtime = "nodejs"

function getBearerToken(value: string | null) {
  if (!value) return null
  const [scheme, token] = value.split(" ")
  if (scheme !== "Bearer" || !token) return null
  return token.trim()
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message
  return String(error)
}

export async function POST(request: NextRequest) {
  const expectedSecret = process.env.INTERNAL_API_SECRET
  if (!expectedSecret) {
    return NextResponse.json(
      { error: "INTERNAL_API_SECRET is not configured" },
      { status: 500 }
    )
  }

  const token = getBearerToken(request.headers.get("authorization"))
  if (token !== expectedSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  let reservationId = ""
  try {
    const body = await request.json()
    reservationId =
      typeof body?.reservationId === "string" ? body.reservationId.trim() : ""
  } catch {
    reservationId = ""
  }

  if (!reservationId) {
    return NextResponse.json(
      { error: "reservationId is required" },
      { status: 400 }
    )
  }

  try {
    const supabase = createServiceClient()

    const reservationResult = await supabase
      .from("reservations")
      .select("id, practice_id, customer_name, phone_number, party_size, date, time, status, notes")
      .eq("id", reservationId)
      .maybeSingle()

    if (reservationResult.error) {
      throw reservationResult.error
    }

    const reservation = reservationResult.data
    if (!reservation) {
      return NextResponse.json({ error: "Reservation not found" }, { status: 404 })
    }

    const practiceResult = await supabase
      .from("practices")
      .select("id, name, email, email_notifications_enabled")
      .eq("id", reservation.practice_id)
      .maybeSingle()

    if (practiceResult.error) {
      throw practiceResult.error
    }

    const practice = practiceResult.data
    if (!practice) {
      return NextResponse.json({ error: "Practice not found" }, { status: 404 })
    }

    if (!practice.email_notifications_enabled) {
      return NextResponse.json({
        ok: true,
        skipped: "notifications_disabled",
      })
    }

    if (!practice.email || !practice.email.trim()) {
      return NextResponse.json({
        ok: true,
        skipped: "missing_recipient_email",
      })
    }

    const event = await acquireNotificationEvent(supabase, {
      practiceId: practice.id,
      eventType: "reservation_created",
      dedupeKey: reservation.id,
      recipientEmail: practice.email,
    })

    if (!event.shouldSend) {
      return NextResponse.json({
        ok: true,
        deduped: true,
        reason: event.reason,
      })
    }

    const template = buildReservationCreatedTemplate({
      practiceName: practice.name || "Ihr Restaurant",
      customerName: reservation.customer_name,
      customerPhone: reservation.phone_number,
      partySize: reservation.party_size,
      reservationDate: reservation.date,
      reservationTime: reservation.time,
      status: reservation.status,
      notes: reservation.notes,
    })

    try {
      await sendEmail({
        to: practice.email,
        subject: template.subject,
        text: template.text,
        html: template.html,
      })
      await markNotificationEventSent(supabase, event.eventId)
    } catch (error) {
      await markNotificationEventFailed(
        supabase,
        event.eventId,
        getErrorMessage(error)
      )
      return NextResponse.json(
        { error: "Failed to send reservation notification email" },
        { status: 500 }
      )
    }

    return NextResponse.json({ ok: true, sent: true })
  } catch (error) {
    console.error("Reservation notification failed:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
