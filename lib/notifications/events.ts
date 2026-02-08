import type { SupabaseClient } from "@supabase/supabase-js"

export type NotificationEventType =
  | "reservation_created"
  | "access_expiring_3d"
  | "call_limit_80"

type AcquireNotificationEventInput = {
  practiceId: string
  eventType: NotificationEventType
  dedupeKey: string
  recipientEmail: string
}

type NotificationEventRow = {
  id: string
  status: "processing" | "sent" | "failed"
}

const DUPLICATE_KEY_ERROR_CODE = "23505"

function truncateErrorMessage(message: string, maxLength = 1000) {
  if (message.length <= maxLength) return message
  return message.slice(0, maxLength)
}

async function loadExistingEvent(
  supabase: SupabaseClient,
  input: AcquireNotificationEventInput
) {
  const result = await supabase
    .from("notification_events")
    .select("id, status")
    .eq("practice_id", input.practiceId)
    .eq("event_type", input.eventType)
    .eq("dedupe_key", input.dedupeKey)
    .maybeSingle<NotificationEventRow>()

  if (result.error) {
    throw result.error
  }

  return result.data
}

export async function acquireNotificationEvent(
  supabase: SupabaseClient,
  input: AcquireNotificationEventInput
) {
  const existing = await loadExistingEvent(supabase, input)

  if (existing?.status === "sent") {
    return { eventId: existing.id, shouldSend: false, reason: "already_sent" as const }
  }

  if (existing?.status === "processing") {
    return {
      eventId: existing.id,
      shouldSend: false,
      reason: "already_processing" as const,
    }
  }

  if (existing?.status === "failed") {
    const retryResult = await supabase
      .from("notification_events")
      .update({
        status: "processing",
        error_message: null,
        sent_at: null,
      })
      .eq("id", existing.id)

    if (retryResult.error) {
      throw retryResult.error
    }

    return { eventId: existing.id, shouldSend: true, reason: "retry_failed" as const }
  }

  const insertResult = await supabase
    .from("notification_events")
    .insert({
      practice_id: input.practiceId,
      event_type: input.eventType,
      dedupe_key: input.dedupeKey,
      recipient_email: input.recipientEmail,
      status: "processing",
    })
    .select("id")
    .single<{ id: string }>()

  if (insertResult.error) {
    if ((insertResult.error as { code?: string }).code === DUPLICATE_KEY_ERROR_CODE) {
      const duplicate = await loadExistingEvent(supabase, input)
      if (duplicate) {
        return { eventId: duplicate.id, shouldSend: false, reason: "already_sent" as const }
      }
    }
    throw insertResult.error
  }

  return { eventId: insertResult.data.id, shouldSend: true, reason: "created" as const }
}

export async function markNotificationEventSent(
  supabase: SupabaseClient,
  eventId: string
) {
  const result = await supabase
    .from("notification_events")
    .update({
      status: "sent",
      sent_at: new Date().toISOString(),
      error_message: null,
    })
    .eq("id", eventId)

  if (result.error) {
    throw result.error
  }
}

export async function markNotificationEventFailed(
  supabase: SupabaseClient,
  eventId: string,
  errorMessage: string
) {
  const result = await supabase
    .from("notification_events")
    .update({
      status: "failed",
      error_message: truncateErrorMessage(errorMessage),
    })
    .eq("id", eventId)

  if (result.error) {
    throw result.error
  }
}
