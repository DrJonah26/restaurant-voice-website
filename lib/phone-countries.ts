export type PhoneCountry = {
  iso2: string
  dialCode: string
  name: string
  flag: string
}

type RawPhoneCountry = {
  iso2: string
  dialCode: string
}

const RAW_PHONE_COUNTRIES: RawPhoneCountry[] = [
  { iso2: "DE", dialCode: "+49" },
  { iso2: "US", dialCode: "+1" },
  { iso2: "GB", dialCode: "+44" },
  { iso2: "FR", dialCode: "+33" },
  { iso2: "ES", dialCode: "+34" },
  { iso2: "IT", dialCode: "+39" },
  { iso2: "NL", dialCode: "+31" },
  { iso2: "BE", dialCode: "+32" },
  { iso2: "LU", dialCode: "+352" },
  { iso2: "AT", dialCode: "+43" },
  { iso2: "CH", dialCode: "+41" },
  { iso2: "IE", dialCode: "+353" },
  { iso2: "PT", dialCode: "+351" },
  { iso2: "PL", dialCode: "+48" },
  { iso2: "CZ", dialCode: "+420" },
  { iso2: "SK", dialCode: "+421" },
  { iso2: "HU", dialCode: "+36" },
  { iso2: "SI", dialCode: "+386" },
  { iso2: "HR", dialCode: "+385" },
  { iso2: "BA", dialCode: "+387" },
  { iso2: "RS", dialCode: "+381" },
  { iso2: "ME", dialCode: "+382" },
  { iso2: "MK", dialCode: "+389" },
  { iso2: "AL", dialCode: "+355" },
  { iso2: "GR", dialCode: "+30" },
  { iso2: "RO", dialCode: "+40" },
  { iso2: "BG", dialCode: "+359" },
  { iso2: "EE", dialCode: "+372" },
  { iso2: "LV", dialCode: "+371" },
  { iso2: "LT", dialCode: "+370" },
  { iso2: "NO", dialCode: "+47" },
  { iso2: "SE", dialCode: "+46" },
  { iso2: "DK", dialCode: "+45" },
  { iso2: "FI", dialCode: "+358" },
  { iso2: "IS", dialCode: "+354" },
  { iso2: "UA", dialCode: "+380" },
  { iso2: "MD", dialCode: "+373" },
  { iso2: "BY", dialCode: "+375" },
  { iso2: "RU", dialCode: "+7" },
  { iso2: "TR", dialCode: "+90" },
  { iso2: "CY", dialCode: "+357" },
  { iso2: "IL", dialCode: "+972" },
  { iso2: "AE", dialCode: "+971" },
  { iso2: "SA", dialCode: "+966" },
  { iso2: "QA", dialCode: "+974" },
  { iso2: "KW", dialCode: "+965" },
  { iso2: "BH", dialCode: "+973" },
  { iso2: "OM", dialCode: "+968" },
  { iso2: "JO", dialCode: "+962" },
  { iso2: "LB", dialCode: "+961" },
  { iso2: "IQ", dialCode: "+964" },
  { iso2: "IR", dialCode: "+98" },
  { iso2: "EG", dialCode: "+20" },
  { iso2: "MA", dialCode: "+212" },
  { iso2: "TN", dialCode: "+216" },
  { iso2: "DZ", dialCode: "+213" },
  { iso2: "LY", dialCode: "+218" },
  { iso2: "SD", dialCode: "+249" },
  { iso2: "ET", dialCode: "+251" },
  { iso2: "KE", dialCode: "+254" },
  { iso2: "TZ", dialCode: "+255" },
  { iso2: "UG", dialCode: "+256" },
  { iso2: "RW", dialCode: "+250" },
  { iso2: "GH", dialCode: "+233" },
  { iso2: "NG", dialCode: "+234" },
  { iso2: "CM", dialCode: "+237" },
  { iso2: "CI", dialCode: "+225" },
  { iso2: "SN", dialCode: "+221" },
  { iso2: "ZA", dialCode: "+27" },
  { iso2: "ZM", dialCode: "+260" },
  { iso2: "ZW", dialCode: "+263" },
  { iso2: "NA", dialCode: "+264" },
  { iso2: "MZ", dialCode: "+258" },
  { iso2: "AO", dialCode: "+244" },
  { iso2: "AR", dialCode: "+54" },
  { iso2: "BR", dialCode: "+55" },
  { iso2: "CL", dialCode: "+56" },
  { iso2: "CO", dialCode: "+57" },
  { iso2: "PE", dialCode: "+51" },
  { iso2: "VE", dialCode: "+58" },
  { iso2: "UY", dialCode: "+598" },
  { iso2: "PY", dialCode: "+595" },
  { iso2: "BO", dialCode: "+591" },
  { iso2: "EC", dialCode: "+593" },
  { iso2: "MX", dialCode: "+52" },
  { iso2: "CA", dialCode: "+1" },
  { iso2: "CR", dialCode: "+506" },
  { iso2: "PA", dialCode: "+507" },
  { iso2: "GT", dialCode: "+502" },
  { iso2: "HN", dialCode: "+504" },
  { iso2: "NI", dialCode: "+505" },
  { iso2: "SV", dialCode: "+503" },
  { iso2: "DO", dialCode: "+1" },
  { iso2: "CU", dialCode: "+53" },
  { iso2: "JM", dialCode: "+1" },
  { iso2: "TT", dialCode: "+1" },
  { iso2: "IN", dialCode: "+91" },
  { iso2: "PK", dialCode: "+92" },
  { iso2: "BD", dialCode: "+880" },
  { iso2: "LK", dialCode: "+94" },
  { iso2: "NP", dialCode: "+977" },
  { iso2: "MM", dialCode: "+95" },
  { iso2: "TH", dialCode: "+66" },
  { iso2: "VN", dialCode: "+84" },
  { iso2: "MY", dialCode: "+60" },
  { iso2: "SG", dialCode: "+65" },
  { iso2: "ID", dialCode: "+62" },
  { iso2: "PH", dialCode: "+63" },
  { iso2: "KH", dialCode: "+855" },
  { iso2: "LA", dialCode: "+856" },
  { iso2: "CN", dialCode: "+86" },
  { iso2: "HK", dialCode: "+852" },
  { iso2: "TW", dialCode: "+886" },
  { iso2: "JP", dialCode: "+81" },
  { iso2: "KR", dialCode: "+82" },
  { iso2: "MN", dialCode: "+976" },
  { iso2: "KZ", dialCode: "+7" },
  { iso2: "UZ", dialCode: "+998" },
  { iso2: "TM", dialCode: "+993" },
  { iso2: "KG", dialCode: "+996" },
  { iso2: "TJ", dialCode: "+992" },
  { iso2: "AF", dialCode: "+93" },
  { iso2: "AU", dialCode: "+61" },
  { iso2: "NZ", dialCode: "+64" },
  { iso2: "FJ", dialCode: "+679" },
  { iso2: "PG", dialCode: "+675" },
  { iso2: "WS", dialCode: "+685" },
  { iso2: "TO", dialCode: "+676" },
  { iso2: "VU", dialCode: "+678" },
  { iso2: "PS", dialCode: "+970" },
  { iso2: "XK", dialCode: "+383" },
  { iso2: "AD", dialCode: "+376" },
  { iso2: "LI", dialCode: "+423" },
  { iso2: "MC", dialCode: "+377" },
  { iso2: "SM", dialCode: "+378" },
  { iso2: "VA", dialCode: "+39" },
  { iso2: "MT", dialCode: "+356" },
  { iso2: "GE", dialCode: "+995" },
  { iso2: "AM", dialCode: "+374" },
  { iso2: "AZ", dialCode: "+994" },
  { iso2: "YE", dialCode: "+967" },
]

const createDisplayNames = (locale: string) => {
  try {
    return new Intl.DisplayNames([locale], { type: "region" })
  } catch {
    return null
  }
}

const germanDisplayNames = createDisplayNames("de")
const englishDisplayNames = createDisplayNames("en")

const getCountryName = (iso2: string) =>
  germanDisplayNames?.of(iso2) ?? englishDisplayNames?.of(iso2) ?? iso2

const toFlag = (iso2: string) => {
  const normalizedIso2 = iso2.toUpperCase()
  if (!/^[A-Z]{2}$/.test(normalizedIso2)) return "🏳️"

  return String.fromCodePoint(
    ...normalizedIso2
      .split("")
      .map((char) => char.charCodeAt(0) + 127397)
  )
}

const prioritizedCountries: PhoneCountry[] = RAW_PHONE_COUNTRIES.map(
  ({ iso2, dialCode }) => ({
    iso2,
    dialCode,
    name: getCountryName(iso2),
    flag: toFlag(iso2),
  })
)

export const PHONE_COUNTRIES: PhoneCountry[] = [...prioritizedCountries].sort(
  (a, b) => a.name.localeCompare(b.name, "de")
)

export const DEFAULT_PHONE_COUNTRY_ISO2 = "DE"

const countriesByIso2 = new Map(
  prioritizedCountries.map((country) => [country.iso2, country])
)

const primaryCountryByDialCode = new Map<string, PhoneCountry>()
for (const country of prioritizedCountries) {
  if (!primaryCountryByDialCode.has(country.dialCode)) {
    primaryCountryByDialCode.set(country.dialCode, country)
  }
}

const dialCodesByLength = [...primaryCountryByDialCode.keys()].sort(
  (a, b) => b.length - a.length
)

export const getPhoneCountryByIso2 = (iso2: string): PhoneCountry =>
  countriesByIso2.get(iso2.toUpperCase()) ??
  countriesByIso2.get(DEFAULT_PHONE_COUNTRY_ISO2)!

const normalizePhoneText = (value: string) =>
  value.trim().replace(/[\s().-]+/g, "").replace(/(?!^)\+/g, "")

export const findPhoneCountryByDialCode = (
  phoneNumber: string
): PhoneCountry | null => {
  const normalizedPhoneNumber = normalizePhoneText(phoneNumber)
  if (!normalizedPhoneNumber.startsWith("+")) return null

  for (const dialCode of dialCodesByLength) {
    if (normalizedPhoneNumber.startsWith(dialCode)) {
      return primaryCountryByDialCode.get(dialCode) ?? null
    }
  }

  return null
}

export const parseStoredPhoneNumber = (value: string) => {
  const fallbackCountry = getPhoneCountryByIso2(DEFAULT_PHONE_COUNTRY_ISO2)
  const normalizedValue = normalizePhoneText(value)

  if (!normalizedValue) {
    return { country: fallbackCountry, localNumber: "" }
  }

  if (!normalizedValue.startsWith("+")) {
    return { country: fallbackCountry, localNumber: normalizedValue }
  }

  const matchedCountry = findPhoneCountryByDialCode(normalizedValue)
  if (!matchedCountry) {
    return {
      country: fallbackCountry,
      localNumber: normalizedValue.replace(/^\+/, ""),
    }
  }

  return {
    country: matchedCountry,
    localNumber: normalizedValue.slice(matchedCountry.dialCode.length),
  }
}

export const formatPhoneNumberForStorage = (
  countryIso2: string,
  localNumber: string
) => {
  const normalizedLocalNumber = localNumber.replace(/\D+/g, "")
  if (!normalizedLocalNumber) return null

  return `${getPhoneCountryByIso2(countryIso2).dialCode}${normalizedLocalNumber}`
}
