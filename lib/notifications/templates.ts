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

// ─── Version 1: Warm Restaurant Design ───────────────────────────────────────
// Warm off-white background, amber accent bar, alternating table rows
export function buildReservationHtmlV1(
  practiceName: string,
  customerName: string,
  customerPhone: string,
  partySizeLabel: string,
  reservationDate: string,
  reservationTime: string,
  status: string,
  notes: string
): string {
  const rows: Array<[string, string]> = [
    ["Name", customerName],
    ["Telefon", customerPhone],
    ["Personen", partySizeLabel],
    ["Datum", reservationDate],
    ["Uhrzeit", reservationTime],
    ["Status", status],
    ["Notizen", notes],
  ]

  const rowsHtml = rows
    .map(([label, value], i) => {
      const bg = i % 2 === 0 ? "#faf7f4" : "#ffffff"
      const isLast = i === rows.length - 1
      const border = isLast ? "" : "border-bottom: 1px solid #e7e5e4;"
      return `<tr style="background-color: ${bg};"><td style="padding: 12px 16px; font-size: 12px; font-weight: 600; color: #78716c; text-transform: uppercase; letter-spacing: 0.5px; width: 36%; font-family: Arial, sans-serif; ${border}">${escapeHtml(label)}</td><td style="padding: 12px 16px; font-size: 14px; color: #1c1917; font-family: Arial, sans-serif; ${border}">${escapeHtml(value)}</td></tr>`
    })
    .join("\n")

  return `<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #faf7f4;">
  <tr>
    <td align="center" style="padding: 44px 16px 36px;">
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="560" style="max-width: 560px; width: 100%;">
        <tr>
          <td align="center" style="padding-bottom: 20px;">
            <p style="margin: 0; font-size: 13px; font-weight: 600; color: #9c8574; letter-spacing: 1.5px; text-transform: uppercase; font-family: Arial, sans-serif;">${escapeHtml(practiceName)}</p>
          </td>
        </tr>
        <tr>
          <td style="background-color: #ffffff; border-radius: 16px; border: 1px solid #ede8e3;">
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
              <tr><td style="height: 4px; background-color: #c2894b; font-size: 0; line-height: 0; border-radius: 16px 16px 0 0;">&nbsp;</td></tr>
              <tr>
                <td style="padding: 32px 40px 36px;">
                  <h1 style="margin: 0 0 8px; font-size: 22px; font-weight: 700; color: #1c1917; line-height: 1.3; font-family: Arial, sans-serif;">Neue Reservierung</h1>
                  <p style="margin: 0 0 28px; font-size: 14px; color: #78716c; line-height: 1.5; font-family: Arial, sans-serif;">Eine neue Reservierung wurde eingetragen.</p>
                  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="border: 1px solid #e7e5e4; border-radius: 10px;">
                    ${rowsHtml}
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td align="center" style="padding-top: 24px;">
            <p style="margin: 0; font-size: 12px; color: #a8a29e; font-family: Arial, sans-serif;">Diese Benachrichtigung wurde automatisch generiert</p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`
}

// ─── Version 2: Apple-style Minimal Design (inspired by JoydeAI) ──────────────
// Cool light gray background, white rounded card, SF Pro typography, notice box
export function buildReservationHtmlV2(
  practiceName: string,
  customerName: string,
  customerPhone: string,
  partySizeLabel: string,
  reservationDate: string,
  reservationTime: string,
  status: string,
  notes: string
): string {
  const rows: Array<[string, string]> = [
    ["Name", customerName],
    ["Telefon", customerPhone],
    ["Personen", partySizeLabel],
    ["Datum", reservationDate],
    ["Uhrzeit", reservationTime],
    ["Status", status],
    ["Notizen", notes],
  ]

  const rowsHtml = rows
    .map(([label, value], i) => {
      const isLast = i === rows.length - 1
      const border = isLast ? "" : "border-bottom: 1px solid #e8e8ed;"
      return `<tr><td style="padding: 12px 0; font-size: 14px; font-weight: 600; color: #1d1d1f; width: 40%; font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif; ${border}">${escapeHtml(label)}</td><td style="padding: 12px 0; font-size: 14px; color: #86868b; font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif; ${border}">${escapeHtml(value)}</td></tr>`
    })
    .join("\n")

  const year = new Date().getFullYear()

  return `<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f5f5f7;">
  <tr>
    <td align="center" style="padding: 48px 16px 32px;">
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="520" style="max-width: 520px; width: 100%;">
        <tr>
          <td align="center" style="padding-bottom: 32px;">
            <p style="margin: 0; font-size: 20px; font-weight: 600; color: #1d1d1f; letter-spacing: -0.3px; font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif;">${escapeHtml(practiceName)}</p>
          </td>
        </tr>
        <tr>
          <td style="background-color: #ffffff; border-radius: 18px;">
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
              <tr>
                <td style="padding: 48px 44px;">
                  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                    <tr><td style="padding-bottom: 10px;"><h1 style="margin: 0; font-size: 24px; font-weight: 600; color: #1d1d1f; line-height: 1.25; letter-spacing: -0.3px; font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif;">Neue Reservierung</h1></td></tr>
                    <tr><td style="padding-bottom: 32px;"><p style="margin: 0; font-size: 15px; line-height: 1.6; color: #86868b; font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif;">Eine neue Reservierung wurde eingetragen.</p></td></tr>
                  </table>
                  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                    <tr><td style="padding-bottom: 28px;"><div style="height: 1px; background-color: #e8e8ed; width: 100%;"></div></td></tr>
                  </table>
                  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                    ${rowsHtml}
                  </table>
                  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                    <tr><td style="padding: 28px 0 24px;"><div style="height: 1px; background-color: #e8e8ed; width: 100%;"></div></td></tr>
                  </table>
                  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f5f5f7; border-radius: 12px;">
                    <tr>
                      <td style="padding: 16px 20px;">
                        <p style="margin: 0; font-size: 13px; line-height: 1.5; color: #86868b; font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif;">Diese Benachrichtigung wurde automatisch durch Ihr Reservierungssystem generiert.</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding: 28px 0 0;">
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
              <tr>
                <td align="center" style="padding-bottom: 8px;">
                  <p style="margin: 0; font-size: 12px; line-height: 1.5; color: #86868b; font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif;">&copy; ${year} ${escapeHtml(practiceName)}. Alle Rechte vorbehalten.</p>
                </td>
              </tr>
              <tr>
                <td align="center">
                  <p style="margin: 0; font-size: 12px; line-height: 1.5; font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif;">
                    <a href="#" style="color: #86868b; text-decoration: none;">Datenschutz</a>
                    <span style="color: #d2d2d7; padding: 0 6px;">|</span>
                    <a href="#" style="color: #86868b; text-decoration: none;">Impressum</a>
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`
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

  // To switch design: replace buildReservationHtmlV2 with buildReservationHtmlV1
  const html = buildReservationHtmlV2(
    practiceName,
    customerName,
    customerPhone,
    partySizeLabel,
    reservationDate,
    reservationTime,
    status,
    notes
  )

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
