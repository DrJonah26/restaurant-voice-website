export const DAY_ORDER = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const

export type DayKey = (typeof DAY_ORDER)[number]

export type DayHours = {
  isOpen: boolean
  openTime: string
  closeTime: string
}

export type OpeningHours = Record<DayKey, DayHours>

export type LegacyHoursFallback = {
  opening_time?: string | null
  closing_time?: string | null
  closed_days?: string[] | null
}

type DbDayHours = {
  is_open: boolean
  open_time: string
  close_time: string
}

type DbOpeningHours = Record<DayKey, DbDayHours>

type DayGroup = {
  dayKeys: DayKey[]
  signature: string
}

const DAY_LABELS: Record<DayKey, string> = {
  monday: "Montag",
  tuesday: "Dienstag",
  wednesday: "Mittwoch",
  thursday: "Donnerstag",
  friday: "Freitag",
  saturday: "Samstag",
  sunday: "Sonntag",
}

const DAY_SHORT_LABELS: Record<DayKey, string> = {
  monday: "Mo",
  tuesday: "Di",
  wednesday: "Mi",
  thursday: "Do",
  friday: "Fr",
  saturday: "Sa",
  sunday: "So",
}

const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/
const DEFAULT_OPEN_TIME = "09:00"
const DEFAULT_CLOSE_TIME = "22:00"

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function sanitizeTime(value: unknown, fallback: string): string {
  if (typeof value !== "string") return fallback
  const trimmed = value.trim()
  return TIME_PATTERN.test(trimmed) ? trimmed : fallback
}

function cloneOpeningHours(source: OpeningHours): OpeningHours {
  return DAY_ORDER.reduce((acc, day) => {
    acc[day] = { ...source[day] }
    return acc
  }, {} as OpeningHours)
}

function getFallbackFromLegacy(legacyFallback?: LegacyHoursFallback): OpeningHours {
  const openTime = sanitizeTime(legacyFallback?.opening_time, DEFAULT_OPEN_TIME)
  const closeTime = sanitizeTime(legacyFallback?.closing_time, DEFAULT_CLOSE_TIME)
  const closedDays = new Set<DayKey>()

  for (const day of legacyFallback?.closed_days ?? []) {
    if (DAY_ORDER.includes(day as DayKey)) {
      closedDays.add(day as DayKey)
    }
  }

  return DAY_ORDER.reduce((acc, day) => {
    acc[day] = {
      isOpen: !closedDays.has(day),
      openTime,
      closeTime,
    }
    return acc
  }, {} as OpeningHours)
}

function isDbDayHoursValid(value: unknown): value is {
  is_open?: unknown
  open_time?: unknown
  close_time?: unknown
} {
  return isRecord(value)
}

function isClosedSignature(signature: string) {
  return signature === "closed"
}

function toDayLabel(dayKeys: DayKey[]) {
  if (dayKeys.length === 1) {
    return DAY_SHORT_LABELS[dayKeys[0]]
  }

  return `${DAY_SHORT_LABELS[dayKeys[0]]}-${DAY_SHORT_LABELS[dayKeys[dayKeys.length - 1]]}`
}

function buildGroups(openingHours: OpeningHours): DayGroup[] {
  const groups: DayGroup[] = []

  for (const day of DAY_ORDER) {
    const dayHours = openingHours[day]
    const signature = dayHours.isOpen
      ? `${dayHours.openTime}-${dayHours.closeTime}`
      : "closed"
    const previous = groups[groups.length - 1]

    if (!previous || previous.signature !== signature) {
      groups.push({
        dayKeys: [day],
        signature,
      })
      continue
    }

    previous.dayKeys.push(day)
  }

  return groups
}

export const DAY_LABEL_BY_KEY = DAY_LABELS

export function defaultOpeningHours(): OpeningHours {
  return DAY_ORDER.reduce((acc, day) => {
    acc[day] = {
      isOpen: true,
      openTime: DEFAULT_OPEN_TIME,
      closeTime: DEFAULT_CLOSE_TIME,
    }
    return acc
  }, {} as OpeningHours)
}

export function hasAnyOpenDay(openingHours: OpeningHours): boolean {
  return DAY_ORDER.some((day) => openingHours[day].isOpen)
}

export function fromDbOpeningHours(
  raw: unknown,
  legacyFallback?: LegacyHoursFallback
): OpeningHours {
  const fallback = getFallbackFromLegacy(legacyFallback)

  if (!isRecord(raw)) {
    return fallback
  }

  const normalized = cloneOpeningHours(fallback)
  let appliedDayCount = 0

  for (const day of DAY_ORDER) {
    const candidate = raw[day]

    if (!isDbDayHoursValid(candidate)) {
      continue
    }

    const isOpen =
      typeof candidate.is_open === "boolean"
        ? candidate.is_open
        : fallback[day].isOpen

    normalized[day] = {
      isOpen,
      openTime: sanitizeTime(candidate.open_time, fallback[day].openTime),
      closeTime: sanitizeTime(candidate.close_time, fallback[day].closeTime),
    }
    appliedDayCount += 1
  }

  return appliedDayCount === 0 ? fallback : normalized
}

export function toDbOpeningHours(openingHours: OpeningHours): DbOpeningHours {
  return DAY_ORDER.reduce((acc, day) => {
    const dayHours = openingHours[day]
    acc[day] = {
      is_open: dayHours.isOpen,
      open_time: sanitizeTime(dayHours.openTime, DEFAULT_OPEN_TIME),
      close_time: sanitizeTime(dayHours.closeTime, DEFAULT_CLOSE_TIME),
    }
    return acc
  }, {} as DbOpeningHours)
}

export function deriveLegacyFields(openingHours: OpeningHours): {
  opening_time: string
  closing_time: string
  closed_days: DayKey[]
} {
  const closedDays = DAY_ORDER.filter((day) => !openingHours[day].isOpen)
  const openDays = DAY_ORDER.filter((day) => openingHours[day].isOpen)

  if (openDays.length === 0) {
    return {
      opening_time: DEFAULT_OPEN_TIME,
      closing_time: DEFAULT_CLOSE_TIME,
      closed_days: closedDays,
    }
  }

  const tupleStats = new Map<
    string,
    { count: number; firstDayIndex: number; openTime: string; closeTime: string }
  >()

  for (const day of openDays) {
    const openTime = sanitizeTime(openingHours[day].openTime, DEFAULT_OPEN_TIME)
    const closeTime = sanitizeTime(openingHours[day].closeTime, DEFAULT_CLOSE_TIME)
    const key = `${openTime}|${closeTime}`
    const existing = tupleStats.get(key)

    if (existing) {
      existing.count += 1
      continue
    }

    tupleStats.set(key, {
      count: 1,
      firstDayIndex: DAY_ORDER.indexOf(day),
      openTime,
      closeTime,
    })
  }

  const mostCommon = [...tupleStats.values()].sort((a, b) => {
    if (b.count !== a.count) {
      return b.count - a.count
    }
    return a.firstDayIndex - b.firstDayIndex
  })[0]

  return {
    opening_time: mostCommon.openTime,
    closing_time: mostCommon.closeTime,
    closed_days: closedDays,
  }
}

export function formatOpeningHoursSummary(openingHours: OpeningHours): string {
  const groups = buildGroups(openingHours)

  if (groups.length === 0) {
    return `${DAY_SHORT_LABELS.monday}-${DAY_SHORT_LABELS.sunday} geschlossen`
  }

  return groups
    .map((group) => {
      const label = toDayLabel(group.dayKeys)
      if (isClosedSignature(group.signature)) {
        return `${label} geschlossen`
      }
      return `${label} ${group.signature}`
    })
    .join(", ")
}
