export type PasswordStrengthLevel = 0 | 1 | 2 | 3 | 4

export interface PasswordStrengthResult {
  strength: PasswordStrengthLevel
  label: "" | "Schwach" | "Mittel" | "Stark" | "Sehr stark"
  isStrong: boolean
  feedback: string[]
}

interface PasswordStrengthOptions {
  email?: string
}

const COMMON_PASSWORDS = new Set([
  "123456",
  "123456789",
  "12345678",
  "qwerty",
  "abc123",
  "password",
  "passwort",
  "111111",
  "123123",
  "letmein",
  "welcome",
  "admin",
  "iloveyou",
  "monkey",
  "dragon",
  "baseball",
  "football",
  "master",
  "shadow",
  "superman",
])

const KEYBOARD_ROWS = [
  "qwertyuiop",
  "asdfghjkl",
  "zxcvbnm",
  "1234567890",
  "0987654321",
  "!@#$%^&*()",
]

const MIN_LENGTH_FOR_STRONG = 10
const MIN_CLASSES_FOR_STRONG = 3
const KEYBOARD_TOKEN_LENGTH = 4

function clampStrength(value: number): PasswordStrengthLevel {
  if (value <= 0) return 0
  if (value === 1) return 1
  if (value === 2) return 2
  if (value === 3) return 3
  return 4
}

function getPasswordLabel(strength: PasswordStrengthLevel): PasswordStrengthResult["label"] {
  if (strength === 1) return "Schwach"
  if (strength === 2) return "Mittel"
  if (strength === 3) return "Stark"
  if (strength === 4) return "Sehr stark"
  return ""
}

function getCharacterClassCount(password: string) {
  const hasLower = /[a-z]/.test(password)
  const hasUpper = /[A-Z]/.test(password)
  const hasDigit = /[0-9]/.test(password)
  const hasSymbol = /[^A-Za-z0-9]/.test(password)

  const classCount = [hasLower, hasUpper, hasDigit, hasSymbol].filter(Boolean).length
  const poolSize =
    (hasLower ? 26 : 0) + (hasUpper ? 26 : 0) + (hasDigit ? 10 : 0) + (hasSymbol ? 33 : 0)

  return { classCount, poolSize }
}

function hasSequentialPattern(password: string): boolean {
  if (password.length < 3) return false
  const value = password.toLowerCase()

  for (let i = 0; i <= value.length - 3; i += 1) {
    const a = value.charCodeAt(i)
    const b = value.charCodeAt(i + 1)
    const c = value.charCodeAt(i + 2)
    if ((b === a + 1 && c === b + 1) || (b === a - 1 && c === b - 1)) {
      return true
    }
  }

  return false
}

function hasKeyboardPattern(password: string): boolean {
  if (password.length < KEYBOARD_TOKEN_LENGTH) return false
  const value = password.toLowerCase()

  for (const row of KEYBOARD_ROWS) {
    const reverseRow = row.split("").reverse().join("")
    for (let i = 0; i <= row.length - KEYBOARD_TOKEN_LENGTH; i += 1) {
      const token = row.slice(i, i + KEYBOARD_TOKEN_LENGTH)
      const reverseToken = reverseRow.slice(i, i + KEYBOARD_TOKEN_LENGTH)
      if (value.includes(token) || value.includes(reverseToken)) {
        return true
      }
    }
  }

  return false
}

function hasRepeatedCharacters(password: string): boolean {
  return /(.)\1{2,}/.test(password) || /(.{2,4})\1{1,}/.test(password.toLowerCase())
}

function getEmailTokens(email?: string): string[] {
  if (!email) return []
  const localPart = email.trim().toLowerCase().split("@")[0] ?? ""
  if (!localPart) return []

  const tokens = localPart
    .split(/[^a-z0-9]+/)
    .map((token) => token.trim())
    .filter((token) => token.length >= 3)

  if (localPart.length >= 3) {
    tokens.push(localPart)
  }

  return Array.from(new Set(tokens))
}

function containsEmailToken(password: string, email?: string): boolean {
  const value = password.toLowerCase()
  const tokens = getEmailTokens(email)
  return tokens.some((token) => value.includes(token))
}

function isCommonPassword(password: string): boolean {
  const value = password.toLowerCase()
  const normalized = value.replace(/[^a-z0-9]/g, "")
  const leetNormalized = value
    .replace(/[@]/g, "a")
    .replace(/[4]/g, "a")
    .replace(/[3]/g, "e")
    .replace(/[1!]/g, "i")
    .replace(/[0]/g, "o")
    .replace(/[$5]/g, "s")
    .replace(/[7]/g, "t")
    .replace(/[^a-z0-9]/g, "")

  return (
    COMMON_PASSWORDS.has(value) ||
    COMMON_PASSWORDS.has(normalized) ||
    COMMON_PASSWORDS.has(leetNormalized)
  )
}

export function evaluatePasswordStrength(
  password: string,
  options: PasswordStrengthOptions = {}
): PasswordStrengthResult {
  if (!password) {
    return {
      strength: 0,
      label: "",
      isStrong: false,
      feedback: [],
    }
  }

  const { classCount, poolSize } = getCharacterClassCount(password)
  const entropy = poolSize > 0 ? password.length * Math.log2(poolSize) : 0

  const hasSequence = hasSequentialPattern(password)
  const hasKeyboard = hasKeyboardPattern(password)
  const hasRepeats = hasRepeatedCharacters(password)
  const usesCommonPassword = isCommonPassword(password)
  const containsPersonalInfo = containsEmailToken(password, options.email)

  let penalty = 0
  if (hasSequence) penalty += 12
  if (hasKeyboard) penalty += 10
  if (hasRepeats) penalty += 8
  if (usesCommonPassword) penalty += 30
  if (containsPersonalInfo) penalty += 12

  const effectiveEntropy = Math.max(0, entropy - penalty)

  let strength = 1
  if (effectiveEntropy >= 55) strength = 2
  if (effectiveEntropy >= 72) strength = 3
  if (effectiveEntropy >= 90) strength = 4

  const hasMinLength = password.length >= MIN_LENGTH_FOR_STRONG
  const hasEnoughClasses = classCount >= MIN_CLASSES_FOR_STRONG

  if (!hasMinLength || !hasEnoughClasses || hasSequence || hasKeyboard || hasRepeats || usesCommonPassword || containsPersonalInfo) {
    strength = Math.min(strength, 2)
  }

  const isStrong =
    strength >= 3 &&
    hasMinLength &&
    hasEnoughClasses &&
    !hasSequence &&
    !hasKeyboard &&
    !hasRepeats &&
    !usesCommonPassword &&
    !containsPersonalInfo

  const feedback: string[] = []
  if (!hasMinLength) {
    feedback.push(`Mindestens ${MIN_LENGTH_FOR_STRONG} Zeichen verwenden.`)
  }
  if (!hasEnoughClasses) {
    feedback.push("Mindestens 3 Zeichenarten nutzen: Klein-/Grossbuchstaben, Zahlen, Sonderzeichen.")
  }
  if (hasSequence) {
    feedback.push("Keine einfachen Zeichenfolgen wie abc oder 123 verwenden.")
  }
  if (hasKeyboard) {
    feedback.push("Keine Tastaturmuster wie qwerty oder 1234 verwenden.")
  }
  if (hasRepeats) {
    feedback.push("Keine langen Wiederholungen wie aaa oder 111 verwenden.")
  }
  if (usesCommonPassword) {
    feedback.push("Dieses Passwort ist zu haeufig und unsicher.")
  }
  if (containsPersonalInfo) {
    feedback.push("Keine persoenlichen Infos wie Teile der E-Mail nutzen.")
  }
  if (isStrong) {
    feedback.push("Passwort ist stark genug.")
  }

  const clamped = clampStrength(strength)
  return {
    strength: clamped,
    label: getPasswordLabel(clamped),
    isStrong,
    feedback,
  }
}
