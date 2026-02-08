import "server-only"
import nodemailer from "nodemailer"

type SendEmailInput = {
  to: string
  subject: string
  text: string
  html: string
}

function parseBoolean(value: string | undefined, fallback: boolean) {
  if (!value) return fallback
  const normalized = value.trim().toLowerCase()
  if (normalized === "true") return true
  if (normalized === "false") return false
  return fallback
}

function getSmtpConfig() {
  const host = process.env.SMTP_HOST
  const portRaw = process.env.SMTP_PORT
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS
  const from = process.env.SMTP_FROM

  if (!host || !user || !pass || !from) {
    throw new Error("SMTP environment variables are incomplete")
  }

  const port = portRaw ? Number(portRaw) : 465
  if (!Number.isFinite(port)) {
    throw new Error("SMTP_PORT must be a valid number")
  }

  const secure = parseBoolean(process.env.SMTP_SECURE, port === 465)

  return { host, port, secure, user, pass, from }
}

let transporter: ReturnType<typeof nodemailer.createTransport> | null = null

function getTransporter() {
  if (transporter) return transporter
  const config = getSmtpConfig()
  transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: {
      user: config.user,
      pass: config.pass,
    },
  })
  return transporter
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message
  return String(error)
}

export async function sendEmail(input: SendEmailInput) {
  const config = getSmtpConfig()
  const smtpTransporter = getTransporter()

  try {
    const info = await smtpTransporter.sendMail({
      from: config.from,
      to: input.to,
      subject: input.subject,
      text: input.text,
      html: input.html,
    })

    return { messageId: info.messageId }
  } catch (error) {
    throw new Error(`Email send failed: ${getErrorMessage(error)}`)
  }
}
