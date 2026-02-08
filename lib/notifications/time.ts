const BERLIN_TIME_ZONE = "Europe/Berlin"

const BERLIN_DATE_PARTS = new Intl.DateTimeFormat("en-CA", {
  timeZone: BERLIN_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
})

function getBerlinDateParts(date: Date) {
  const parts = BERLIN_DATE_PARTS.formatToParts(date)
  const year = parts.find((part) => part.type === "year")?.value
  const month = parts.find((part) => part.type === "month")?.value
  const day = parts.find((part) => part.type === "day")?.value

  if (!year || !month || !day) {
    throw new Error("Failed to resolve Berlin date parts")
  }

  return { year, month, day }
}

function parseDateKey(dateKey: string) {
  const [yearRaw, monthRaw, dayRaw] = dateKey.split("-")
  const year = Number(yearRaw)
  const month = Number(monthRaw)
  const day = Number(dayRaw)

  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) {
    return null
  }

  return { year, month, day }
}

export function berlinDateKey(date: Date) {
  const { year, month, day } = getBerlinDateParts(date)
  return `${year}-${month}-${day}`
}

export function berlinMonthKey(date: Date) {
  const { year, month } = getBerlinDateParts(date)
  return `${year}-${month}`
}

export function daysBetweenBerlinDates(from: Date, to: Date) {
  const fromKey = berlinDateKey(from)
  const toKey = berlinDateKey(to)
  const parsedFrom = parseDateKey(fromKey)
  const parsedTo = parseDateKey(toKey)

  if (!parsedFrom || !parsedTo) {
    throw new Error("Invalid Berlin date key")
  }

  const fromUtc = Date.UTC(parsedFrom.year, parsedFrom.month - 1, parsedFrom.day)
  const toUtc = Date.UTC(parsedTo.year, parsedTo.month - 1, parsedTo.day)
  const DAY_IN_MS = 24 * 60 * 60 * 1000

  return Math.round((toUtc - fromUtc) / DAY_IN_MS)
}

export function formatGermanDate(date: Date) {
  return new Intl.DateTimeFormat("de-DE", {
    timeZone: BERLIN_TIME_ZONE,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date)
}

export function getBerlinTimeZone() {
  return BERLIN_TIME_ZONE
}
