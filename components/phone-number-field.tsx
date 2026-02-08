"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Check, ChevronDown } from "lucide-react"

import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { PHONE_COUNTRIES, getPhoneCountryByIso2 } from "@/lib/phone-countries"

type PhoneNumberFieldProps = {
  id: string
  countryIso2: string
  onCountryIso2Change: (iso2: string) => void
  localNumber: string
  onLocalNumberChange: (value: string) => void
  placeholder?: string
  required?: boolean
  disabled?: boolean
  className?: string
}

export function PhoneNumberField({
  id,
  countryIso2,
  onCountryIso2Change,
  localNumber,
  onLocalNumberChange,
  placeholder,
  required,
  disabled,
  className,
}: PhoneNumberFieldProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const containerRef = useRef<HTMLDivElement | null>(null)
  const selectedCountry = getPhoneCountryByIso2(countryIso2)

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent | TouchEvent) => {
      if (
        containerRef.current &&
        event.target instanceof Node &&
        !containerRef.current.contains(event.target)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleOutsideClick)
    document.addEventListener("touchstart", handleOutsideClick)

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick)
      document.removeEventListener("touchstart", handleOutsideClick)
    }
  }, [])

  useEffect(() => {
    if (!isOpen) {
      setSearchQuery("")
    }
  }, [isOpen])

  const filteredCountries = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase()
    if (!normalizedQuery) return PHONE_COUNTRIES

    return PHONE_COUNTRIES.filter((country) => {
      return (
        country.name.toLowerCase().includes(normalizedQuery) ||
        country.iso2.toLowerCase().includes(normalizedQuery) ||
        country.dialCode.includes(normalizedQuery.replace(/\s+/g, ""))
      )
    })
  }, [searchQuery])

  const getFlagUrl = (iso2: string) =>
    `https://flagcdn.com/24x18/${iso2.toLowerCase()}.png`

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <div className="flex">
        <button
          type="button"
          onClick={() => setIsOpen((current) => !current)}
          className="flex h-10 min-w-[8.5rem] items-center justify-between rounded-l-md border border-input/50 bg-background/50 px-3 text-sm backdrop-blur-sm transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          disabled={disabled}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-label="Ländervorwahl auswählen"
        >
          <span className="flex items-center gap-2">
            <img
              src={getFlagUrl(selectedCountry.iso2)}
              alt={selectedCountry.name}
              width={18}
              height={14}
              className="h-[14px] w-[18px] shrink-0 rounded-[2px] object-cover"
              loading="lazy"
            />
            <span className="tabular-nums">{selectedCountry.dialCode}</span>
          </span>
          <ChevronDown className="ml-2 h-4 w-4 text-muted-foreground" />
        </button>

        <Input
          id={id}
          type="tel"
          value={localNumber}
          onChange={(event) => onLocalNumberChange(event.target.value)}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className="rounded-l-none border-l-0"
        />
      </div>

      {isOpen && (
        <div className="absolute left-0 top-full z-50 mt-2 w-full min-w-[18rem] rounded-md border border-border bg-popover shadow-md">
          <div className="border-b border-border p-2">
            <Input
              type="text"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Land oder Vorwahl suchen..."
              autoFocus
              onKeyDown={(event) => {
                if (event.key === "Escape") {
                  setIsOpen(false)
                }
              }}
            />
          </div>

          <div className="max-h-64 overflow-y-auto p-1" role="listbox">
            {filteredCountries.length > 0 ? (
              filteredCountries.map((country) => {
                const isSelected = country.iso2 === selectedCountry.iso2

                return (
                  <button
                    key={country.iso2}
                    type="button"
                    className={cn(
                      "flex w-full items-center justify-between rounded-sm px-2 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground",
                      isSelected && "bg-accent/40"
                    )}
                    onClick={() => {
                      onCountryIso2Change(country.iso2)
                      setIsOpen(false)
                    }}
                    >
                      <span className="flex min-w-0 items-center gap-2">
                        <img
                          src={getFlagUrl(country.iso2)}
                          alt={country.name}
                          width={18}
                          height={14}
                          className="h-[14px] w-[18px] shrink-0 rounded-[2px] object-cover"
                          loading="lazy"
                        />
                        <span className="shrink-0 tabular-nums font-medium">
                          {country.dialCode}
                        </span>
                      <span className="truncate text-muted-foreground">
                        {country.name}
                      </span>
                    </span>
                    {isSelected ? <Check className="h-4 w-4 shrink-0" /> : null}
                  </button>
                )
              })
            ) : (
              <p className="px-3 py-2 text-sm text-muted-foreground">
                Kein Land gefunden.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
