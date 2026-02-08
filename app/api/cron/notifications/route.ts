import { NextRequest, NextResponse } from "next/server"
import {
  acquireNotificationEvent,
  markNotificationEventFailed,
  markNotificationEventSent,
} from "@/lib/notifications/events"
import { sendEmail } from "@/lib/notifications/mailer"
import {
  buildAccessExpiring3DaysTemplate,
  buildCallLimit80Template,
} from "@/lib/notifications/templates"
import {
  berlinDateKey,
  berlinMonthKey,
  daysBetweenBerlinDates,
} from "@/lib/notifications/time"
import { createServiceClient } from "@/lib/supabase/service"

export const runtime = "nodejs"

type PracticeRecord = {
  id: string
  name: string | null
  email: string | null
  onboarding_completed: boolean | null
  email_notifications_enabled: boolean | null
  notify_access_expiring_3d: boolean | null
  notify_call_limit_80: boolean | null
  subscription_plan: string | null
  trial_ends_at: string | null
  subscription_ends_at: string | null
  subscription_cancel_at_period_end: boolean | null
  calls_limit: number | null
}

type CallLogRecord = {
  practice_id: string | null
  started_at: string | null
}

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

function getUpgradeUrl() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL
  if (!baseUrl) {
    throw new Error("NEXT_PUBLIC_APP_URL is not configured")
  }
  return `${baseUrl.replace(/\/+$/, "")}/dashboard/billing`
}

function getMonthLabel(date: Date) {
  return new Intl.DateTimeFormat("de-DE", {
    month: "long",
    year: "numeric",
    timeZone: "Europe/Berlin",
  }).format(date)
}

function buildMonthlyCallCounts(callLogs: CallLogRecord[]) {
  const map = new Map<string, Map<string, number>>()

  for (const callLog of callLogs) {
    if (!callLog.practice_id || !callLog.started_at) {
      continue
    }

    const callDate = new Date(callLog.started_at)
    if (Number.isNaN(callDate.getTime())) {
      continue
    }

    const monthKey = berlinMonthKey(callDate)
    const monthCounts = map.get(callLog.practice_id) ?? new Map<string, number>()
    monthCounts.set(monthKey, (monthCounts.get(monthKey) ?? 0) + 1)
    map.set(callLog.practice_id, monthCounts)
  }

  return map
}

function resolveAccessWarning(practice: PracticeRecord, now: Date) {
  if (practice.subscription_plan === "trial" && practice.trial_ends_at) {
    const endsAt = new Date(practice.trial_ends_at)
    if (!Number.isNaN(endsAt.getTime()) && daysBetweenBerlinDates(now, endsAt) === 3) {
      return {
        reason: "trial" as const,
        endsAt,
        dedupeKey: `${berlinDateKey(endsAt)}:trial`,
      }
    }
  }

  if (
    practice.subscription_cancel_at_period_end &&
    practice.subscription_ends_at &&
    practice.subscription_plan !== "trial"
  ) {
    const endsAt = new Date(practice.subscription_ends_at)
    if (!Number.isNaN(endsAt.getTime()) && daysBetweenBerlinDates(now, endsAt) === 3) {
      return {
        reason: "canceled" as const,
        endsAt,
        dedupeKey: `${berlinDateKey(endsAt)}:canceled`,
      }
    }
  }

  return null
}

export async function GET(request: NextRequest) {
  const expectedSecret = process.env.CRON_SECRET
  if (!expectedSecret) {
    return NextResponse.json(
      { error: "CRON_SECRET is not configured" },
      { status: 500 }
    )
  }

  const token = getBearerToken(request.headers.get("authorization"))
  if (token !== expectedSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const now = new Date()
    const currentMonthKey = berlinMonthKey(now)
    const upgradeUrl = getUpgradeUrl()
    const supabase = createServiceClient()

    const practicesResult = await supabase
      .from("practices")
      .select(
        "id, name, email, onboarding_completed, email_notifications_enabled, notify_access_expiring_3d, notify_call_limit_80, subscription_plan, trial_ends_at, subscription_ends_at, subscription_cancel_at_period_end, calls_limit"
      )
      .eq("onboarding_completed", true)
      .eq("email_notifications_enabled", true)
      .not("email", "is", null)

    if (practicesResult.error) {
      throw practicesResult.error
    }

    const practices = (practicesResult.data ?? []).filter(
      (practice) => !!practice.email && practice.email.trim().length > 0
    ) as PracticeRecord[]

    const practiceIds = practices.map((practice) => practice.id)
    const callsLookbackStart = new Date(now.getTime() - 45 * 24 * 60 * 60 * 1000)
    let callLogs: CallLogRecord[] = []

    if (practiceIds.length > 0) {
      const callLogsResult = await supabase
        .from("call_logs")
        .select("practice_id, started_at")
        .in("practice_id", practiceIds)
        .gte("started_at", callsLookbackStart.toISOString())

      if (callLogsResult.error) {
        throw callLogsResult.error
      }

      callLogs = (callLogsResult.data ?? []) as CallLogRecord[]
    }

    const monthlyCallCounts = buildMonthlyCallCounts(callLogs)
    const summary = {
      practicesEvaluated: practices.length,
      sent: 0,
      deduped: 0,
      skipped: 0,
      failed: 0,
    }

    for (const practice of practices) {
      const recipientEmail = practice.email?.trim()
      if (!recipientEmail) {
        summary.skipped += 1
        continue
      }

      const accessWarning = resolveAccessWarning(practice, now)
      if (accessWarning && practice.notify_access_expiring_3d !== false) {
        const event = await acquireNotificationEvent(supabase, {
          practiceId: practice.id,
          eventType: "access_expiring_3d",
          dedupeKey: accessWarning.dedupeKey,
          recipientEmail,
        })

        if (!event.shouldSend) {
          summary.deduped += 1
        } else {
          const template = buildAccessExpiring3DaysTemplate({
            practiceName: practice.name || "Ihr Restaurant",
            accessEndsAt: accessWarning.endsAt,
            reason: accessWarning.reason,
            upgradeUrl,
          })

          try {
            await sendEmail({
              to: recipientEmail,
              subject: template.subject,
              text: template.text,
              html: template.html,
            })
            await markNotificationEventSent(supabase, event.eventId)
            summary.sent += 1
          } catch (error) {
            await markNotificationEventFailed(
              supabase,
              event.eventId,
              getErrorMessage(error)
            )
            summary.failed += 1
          }
        }
      }

      const callsLimit = practice.calls_limit ?? 0
      if (practice.notify_call_limit_80 === false) {
        continue
      }
      if (callsLimit <= 0) {
        continue
      }

      const callsUsed =
        monthlyCallCounts.get(practice.id)?.get(currentMonthKey) ?? 0
      const limitThreshold = Math.ceil(callsLimit * 0.8)

      if (callsUsed < limitThreshold) {
        continue
      }

      const event = await acquireNotificationEvent(supabase, {
        practiceId: practice.id,
        eventType: "call_limit_80",
        dedupeKey: currentMonthKey,
        recipientEmail,
      })

      if (!event.shouldSend) {
        summary.deduped += 1
        continue
      }

      const template = buildCallLimit80Template({
        practiceName: practice.name || "Ihr Restaurant",
        callsUsed,
        callsLimit,
        monthLabel: getMonthLabel(now),
        upgradeUrl,
      })

      try {
        await sendEmail({
          to: recipientEmail,
          subject: template.subject,
          text: template.text,
          html: template.html,
        })
        await markNotificationEventSent(supabase, event.eventId)
        summary.sent += 1
      } catch (error) {
        await markNotificationEventFailed(
          supabase,
          event.eventId,
          getErrorMessage(error)
        )
        summary.failed += 1
      }
    }

    const status = summary.failed > 0 ? 500 : 200
    return NextResponse.json({ ok: summary.failed === 0, summary }, { status })
  } catch (error) {
    console.error("Cron notifications failed:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
