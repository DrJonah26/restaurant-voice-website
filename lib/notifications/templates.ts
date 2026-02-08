import { formatGermanDate } from "@/lib/notifications/time"

type EmailTemplate = {
  subject: string
  text: string
  html: string
}

type ReservationCreatedTemplateInput = {
  practiceName: string
  customerName: string | null
  customerPhone: string | null
  partySize: number | null
  reservationDate: string | null
  reservationTime: string | null
  status: string | null
  notes: string | null
}

type AccessExpiringTemplateInput = {
  practiceName: string
  accessEndsAt: Date
  reason: "trial" | "canceled"
  upgradeUrl: string
}

type CallLimitTemplateInput = {
  practiceName: string
  callsUsed: number
  callsLimit: number
  monthLabel: string
  upgradeUrl: string
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;")
}

function normalizeTime(value: string | null) {
  if (!value) return "-"
  const trimmed = value.trim()
  if (!trimmed) return "-"
  return trimmed.length >= 5 ? trimmed.slice(0, 5) : trimmed
}

function parseDateFromKey(value: string | null) {
  if (!value) return null
  const [yearRaw, monthRaw, dayRaw] = value.split("-")
  const year = Number(yearRaw)
  const month = Number(monthRaw)
  const day = Number(dayRaw)
  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) {
    return null
  }
  return new Date(Date.UTC(year, month - 1, day))
}

function formatReservationDate(value: string | null) {
  const parsed = parseDateFromKey(value)
  if (!parsed) return value || "-"
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "UTC",
  }).format(parsed)
}

function ensureAbsoluteUpgradeUrl(value: string) {
  return value.startsWith("http://") || value.startsWith("https://")
    ? value
    : `https://${value}`
}

export function buildReservationCreatedTemplate(
  input: ReservationCreatedTemplateInput
): EmailTemplate {
  const practiceName = input.practiceName || "Ihr Restaurant"
  const customerName = input.customerName || "-"
  const customerPhone = input.customerPhone || "-"
  const partySizeLabel = input.partySize ? `${input.partySize}` : "-"
  const reservationDate = formatReservationDate(input.reservationDate)
  const reservationTime = normalizeTime(input.reservationTime)
  const status = input.status || "-"
  const notes = input.notes?.trim() ? input.notes.trim() : "Keine"

  const subject = `Neue Reservierung: ${customerName} am ${reservationDate}`
  const text = [
    `${practiceName}: Es wurde eine neue Reservierung eingetragen.`,
    "",
    `Name: ${customerName}`,
    `Telefon: ${customerPhone}`,
    `Personen: ${partySizeLabel}`,
    `Datum: ${reservationDate}`,
    `Uhrzeit: ${reservationTime}`,
    `Status: ${status}`,
    `Notizen: ${notes}`,
  ].join("\n")

  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #1f2937;">
      <h2 style="margin: 0 0 16px;">Neue Reservierung</h2>
      <p style="margin: 0 0 16px;">${escapeHtml(practiceName)}: Es wurde eine neue Reservierung eingetragen.</p>
      <table style="border-collapse: collapse;">
        <tr><td style="padding: 4px 12px 4px 0;"><strong>Name</strong></td><td>${escapeHtml(customerName)}</td></tr>
        <tr><td style="padding: 4px 12px 4px 0;"><strong>Telefon</strong></td><td>${escapeHtml(customerPhone)}</td></tr>
        <tr><td style="padding: 4px 12px 4px 0;"><strong>Personen</strong></td><td>${escapeHtml(partySizeLabel)}</td></tr>
        <tr><td style="padding: 4px 12px 4px 0;"><strong>Datum</strong></td><td>${escapeHtml(reservationDate)}</td></tr>
        <tr><td style="padding: 4px 12px 4px 0;"><strong>Uhrzeit</strong></td><td>${escapeHtml(reservationTime)}</td></tr>
        <tr><td style="padding: 4px 12px 4px 0;"><strong>Status</strong></td><td>${escapeHtml(status)}</td></tr>
        <tr><td style="padding: 4px 12px 4px 0;"><strong>Notizen</strong></td><td>${escapeHtml(notes)}</td></tr>
      </table>
    </div>
  `.trim()

  return { subject, text, html }
}

export function buildAccessExpiring3DaysTemplate(
  input: AccessExpiringTemplateInput
): EmailTemplate {
  const practiceName = input.practiceName || "Ihr Restaurant"
  const endsOn = formatGermanDate(input.accessEndsAt)
  const reasonText =
    input.reason === "trial"
      ? "Ihre Testphase endet in 3 Tagen."
      : "Ihr gekündigtes Abonnement endet in 3 Tagen."
  const upgradeUrl = ensureAbsoluteUpgradeUrl(input.upgradeUrl)
  const subject = "Ihr Zugriff läuft in 3 Tagen ab"
  const text = [
    `Hallo ${practiceName},`,
    "",
    reasonText,
    `Ablaufdatum: ${endsOn}`,
    "",
    `Bitte prüfen Sie Ihr Upgrade: ${upgradeUrl}`,
  ].join("\n")

  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #1f2937;">
      <h2 style="margin: 0 0 16px;">Zugriff läuft bald ab</h2>
      <p style="margin: 0 0 8px;">Hallo ${escapeHtml(practiceName)},</p>
      <p style="margin: 0 0 8px;">${escapeHtml(reasonText)}</p>
      <p style="margin: 0 0 16px;"><strong>Ablaufdatum:</strong> ${escapeHtml(endsOn)}</p>
      <p style="margin: 0;">
        <a href="${escapeHtml(upgradeUrl)}" style="color: #2563eb;">Jetzt Upgrade prüfen</a>
      </p>
    </div>
  `.trim()

  return { subject, text, html }
}

export function buildCallLimit80Template(input: CallLimitTemplateInput): EmailTemplate {
  const practiceName = input.practiceName || "Ihr Restaurant"
  const usagePercent = Math.round((input.callsUsed / input.callsLimit) * 100)
  const upgradeUrl = ensureAbsoluteUpgradeUrl(input.upgradeUrl)
  const subject = "80% Ihres Anruflimits erreicht"
  const text = [
    `Hallo ${practiceName},`,
    "",
    `Sie haben ${input.callsUsed} von ${input.callsLimit} Anrufen genutzt (${usagePercent}%).`,
    `Monat: ${input.monthLabel}`,
    "",
    `Prüfen Sie ein Upgrade, um Engpässe zu vermeiden: ${upgradeUrl}`,
  ].join("\n")

  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #1f2937;">
      <h2 style="margin: 0 0 16px;">Anruflimit fast erreicht</h2>
      <p style="margin: 0 0 8px;">Hallo ${escapeHtml(practiceName)},</p>
      <p style="margin: 0 0 8px;">
        Sie haben <strong>${escapeHtml(String(input.callsUsed))}</strong> von
        <strong> ${escapeHtml(String(input.callsLimit))}</strong> Anrufen genutzt (${escapeHtml(
          String(usagePercent)
        )}%).
      </p>
      <p style="margin: 0 0 16px;"><strong>Monat:</strong> ${escapeHtml(input.monthLabel)}</p>
      <p style="margin: 0;">
        <a href="${escapeHtml(upgradeUrl)}" style="color: #2563eb;">Upgrade ansehen</a>
      </p>
    </div>
  `.trim()

  return { subject, text, html }
}
