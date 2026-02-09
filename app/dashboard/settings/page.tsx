"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { PhoneNumberField } from "@/components/phone-number-field"
import { toast } from "sonner"
import { Info, Save } from "lucide-react"
import {
  DEFAULT_PHONE_COUNTRY_ISO2,
  formatPhoneNumberForStorage,
  parseStoredPhoneNumber,
} from "@/lib/phone-countries"

const DAYS = [
  { value: "monday", label: "Montag" },
  { value: "tuesday", label: "Dienstag" },
  { value: "wednesday", label: "Mittwoch" },
  { value: "thursday", label: "Donnerstag" },
  { value: "friday", label: "Freitag" },
  { value: "saturday", label: "Samstag" },
  { value: "sunday", label: "Sonntag" },
]

export default function SettingsPage() {
  const router = useRouter()
  const [restaurant, setRestaurant] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  // Restaurant settings
  const [restaurantName, setRestaurantName] = useState("")
  const [maxCapacity, setMaxCapacity] = useState([50])
  const [openingTime, setOpeningTime] = useState("09:00")
  const [closingTime, setClosingTime] = useState("22:00")
  const [closedDays, setClosedDays] = useState<string[]>([])

  // Phone settings
  const [phoneCountryIso2, setPhoneCountryIso2] = useState(
    DEFAULT_PHONE_COUNTRY_ISO2
  )
  const [phoneNumber, setPhoneNumber] = useState("")
  const [extraPhoneCountryIso2, setExtraPhoneCountryIso2] = useState(
    DEFAULT_PHONE_COUNTRY_ISO2
  )
  const [extraPhoneNumber, setExtraPhoneNumber] = useState("")
  const [provisionedNumber, setProvisionedNumber] = useState<string | null>(null)

  // Notification settings
  const [emailNotificationsEnabled, setEmailNotificationsEnabled] = useState(true)
  const [notifyReservationCreated, setNotifyReservationCreated] = useState(true)
  const [notifyAccessExpiring3d, setNotifyAccessExpiring3d] = useState(true)
  const [notifyCallLimit80, setNotifyCallLimit80] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/auth/login")
        return
      }

      const { data: restaurantData } = await supabase
        .from("practices")
        .select("*")
        .eq("user_id", user.id)
        .single()

      if (!restaurantData) {
        router.push("/onboarding")
        return
      }

      setRestaurant(restaurantData)
      setRestaurantName(restaurantData.name || "")
      setMaxCapacity([restaurantData.max_capacity || 50])
      setOpeningTime(restaurantData.opening_time || "09:00")
      setClosingTime(restaurantData.closing_time || "22:00")
      setClosedDays(restaurantData.closed_days || [])
      const parsedPhoneNumber = parseStoredPhoneNumber(
        restaurantData.phone_number || ""
      )
      const parsedExtraPhoneNumber = parseStoredPhoneNumber(
        restaurantData.extra_number || ""
      )
      setPhoneCountryIso2(parsedPhoneNumber.country.iso2)
      setPhoneNumber(parsedPhoneNumber.localNumber)
      setExtraPhoneCountryIso2(parsedExtraPhoneNumber.country.iso2)
      setExtraPhoneNumber(parsedExtraPhoneNumber.localNumber)
      setProvisionedNumber(restaurantData.twilio_number || null)
      setEmailNotificationsEnabled(
        restaurantData.email_notifications_enabled ?? true
      )
      setNotifyReservationCreated(
        restaurantData.notify_reservation_created ?? true
      )
      setNotifyAccessExpiring3d(
        restaurantData.notify_access_expiring_3d ?? true
      )
      setNotifyCallLimit80(restaurantData.notify_call_limit_80 ?? true)
    }

    loadData()
  }, [router, supabase])

  const handleDayToggle = (day: string) => {
    setClosedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    )
  }

  const handleSaveRestaurant = async () => {
    setLoading(true)
    try {
      const { error } = await supabase
        .from("practices")
        .update({
          name: restaurantName,
          max_capacity: maxCapacity[0],
          opening_time: openingTime,
          closing_time: closingTime,
          closed_days: closedDays,
        })
        .eq("id", restaurant.id)

      if (error) throw error

      toast.success("Restaurant-Einstellungen gespeichert")
    } catch (error: any) {
      toast.error(error.message || "Fehler beim Speichern")
    } finally {
      setLoading(false)
    }
  }

  const handleSavePhone = async () => {
    const businessPhone = formatPhoneNumberForStorage(phoneCountryIso2, phoneNumber)
    const extraPhone = formatPhoneNumberForStorage(
      extraPhoneCountryIso2,
      extraPhoneNumber
    )

    if (!businessPhone || !extraPhone) {
      toast.error("Bitte füllen Sie Geschäftsnummer und Rufnummer für Weiterleitung aus")
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase
        .from("practices")
        .update({
          phone_number: businessPhone,
          extra_number: extraPhone,
        })
        .eq("id", restaurant.id)

      if (error) throw error

      toast.success("Telefon-Einstellungen gespeichert")
    } catch (error: any) {
      toast.error(error.message || "Fehler beim Speichern")
    } finally {
      setLoading(false)
    }
  }

  const handleSaveNotifications = async () => {
    setLoading(true)
    try {
      const { error } = await supabase
        .from("practices")
        .update({
          email_notifications_enabled: emailNotificationsEnabled,
          notify_reservation_created: notifyReservationCreated,
          notify_access_expiring_3d: notifyAccessExpiring3d,
          notify_call_limit_80: notifyCallLimit80,
        })
        .eq("id", restaurant.id)

      if (error) throw error

      setRestaurant((prev: any) =>
        prev
          ? {
              ...prev,
              email_notifications_enabled: emailNotificationsEnabled,
              notify_reservation_created: notifyReservationCreated,
              notify_access_expiring_3d: notifyAccessExpiring3d,
              notify_call_limit_80: notifyCallLimit80,
            }
          : prev
      )
      toast.success("Benachrichtigungs-Einstellungen gespeichert")
    } catch (error: any) {
      toast.error(error.message || "Fehler beim Speichern")
    } finally {
      setLoading(false)
    }
  }

  const handleCopyNumber = async () => {
    if (!provisionedNumber) return
    try {
      await navigator.clipboard.writeText(provisionedNumber)
      toast.success("Nummer kopiert")
    } catch (error: any) {
      toast.error(error.message || "Kopieren fehlgeschlagen")
    }
  }
  const forwardingTarget = provisionedNumber ?? "Zielnummer"

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Einstellungen</h1>
        <p className="text-muted-foreground mt-2">
          Verwalten Sie Ihre Restaurant-Konfiguration
        </p>
      </div>

      <Tabs defaultValue="restaurant" className="space-y-6">
        <TabsList>
          <TabsTrigger value="restaurant">Restaurant</TabsTrigger>
          <TabsTrigger value="phone">Telefon</TabsTrigger>
          <TabsTrigger value="notifications">Benachrichtigungen</TabsTrigger>
        </TabsList>

        {/* Restaurant Tab */}
        <TabsContent value="restaurant">
          <Card>
            <CardHeader>
              <CardTitle>Restaurant-Einstellungen</CardTitle>
              <CardDescription>
                Grundlegende Informationen über Ihr Restaurant
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Restaurant Name</Label>
                <Input
                  id="name"
                  value={restaurantName}
                  onChange={(e) => setRestaurantName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Maximale Kapazität: {maxCapacity[0]} Personen</Label>
                <Slider
                  value={maxCapacity}
                  onValueChange={setMaxCapacity}
                  min={10}
                  max={200}
                  step={5}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="openingTime">Öffnungszeit</Label>
                  <Input
                    id="openingTime"
                    type="time"
                    value={openingTime}
                    onChange={(e) => setOpeningTime(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="closingTime">Schließzeit</Label>
                  <Input
                    id="closingTime"
                    type="time"
                    value={closingTime}
                    onChange={(e) => setClosingTime(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Geschlossene Tage</Label>
                <div className="grid grid-cols-2 gap-2">
                  {DAYS.map((day) => (
                    <div key={day.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={day.value}
                        checked={closedDays.includes(day.value)}
                        onCheckedChange={() => handleDayToggle(day.value)}
                      />
                      <Label
                        htmlFor={day.value}
                        className="text-sm font-normal cursor-pointer"
                      >
                        {day.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
              <Button onClick={handleSaveRestaurant} disabled={loading}>
                <Save className="mr-2 h-4 w-4" />
                Speichern
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Phone Tab */}
        <TabsContent value="phone">
          <Card>
            <CardHeader>
              <CardTitle>Telefon-Einstellungen</CardTitle>
              <CardDescription>
                Verwalten Sie Ihre Telefonnummer und richten Sie die Weiterleitung ein
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Geschäftsnummer *</Label>
                <PhoneNumberField
                  id="phoneNumber"
                  countryIso2={phoneCountryIso2}
                  onCountryIso2Change={setPhoneCountryIso2}
                  localNumber={phoneNumber}
                  onLocalNumberChange={setPhoneNumber}
                  placeholder="30 1234 5678"
                  required
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="extraPhoneNumber">Rufnummer für Weiterleitung *</Label>
                  <span className="group relative inline-flex">
                    <button
                      type="button"
                      aria-label="Information zur weiteren Telefonnummer"
                      className="inline-flex h-4 w-4 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <Info className="h-3.5 w-3.5" />
                    </button>
                    <span className="pointer-events-none absolute left-1/2 top-full z-20 mt-2 w-72 -translate-x-1/2 rounded-md border border-border bg-popover p-2 text-xs text-popover-foreground opacity-0 shadow-md transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
                      Damit wir Ihre Kunden bei Bedarf persönlich verbinden können, benötigen wir eine zweite Rufnummer für die KI-Weiterleitung.
                    </span>
                  </span>
                </div>
                <PhoneNumberField
                  id="extraPhoneNumber"
                  countryIso2={extraPhoneCountryIso2}
                  onCountryIso2Change={setExtraPhoneCountryIso2}
                  localNumber={extraPhoneNumber}
                  onLocalNumberChange={setExtraPhoneNumber}
                  placeholder="30 1234 5678"
                  required
                />
              </div>
              <div className="rounded-lg border border-border bg-muted/10 p-4">
                <div className="space-y-2">
                  <p className="text-sm font-semibold">
                    Anleitung zur Weiterleitung einer Telefonnummer
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Geben Sie die untenstehenden Tastenkombinationen auf Ihrem Gerät ein.
                  </p>
                </div>
                <div className="mt-4 space-y-3">
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground">Zielnummer</p>
                    <div className="mt-1 flex items-center gap-3">
                      <p className="text-lg font-medium">
                        {provisionedNumber ?? "Noch nicht verfügbar"}
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleCopyNumber}
                        disabled={!provisionedNumber}
                      >
                        Kopieren
                      </Button>
                    </div>
                  </div>
                  <div className="rounded-md border border-border bg-background p-3 text-sm">
                    <div className="font-medium">Für alle Anrufe</div>
                    <div>{`**21*${forwardingTarget}#`}</div>
                  </div>
                  <div className="rounded-md border border-border bg-background p-3 text-sm">
                    <div className="font-medium">Nur bei nicht besetzt</div>
                    <div>{`**67*${forwardingTarget}#`}</div>
                  </div>
                  <div className="rounded-md border border-border bg-background p-3 text-sm">
                    <div className="font-medium">Nur bei nicht melden</div>
                    <div>{`**61*${forwardingTarget}#`}</div>
                  </div>
                  <div className="rounded-md border border-border bg-background p-3 text-sm">
                    <div className="font-medium">Deaktivieren</div>
                    <div>##21#</div>
                  </div>
                </div>
              </div>
              <Button
                onClick={handleSavePhone}
                disabled={
                  loading ||
                  !formatPhoneNumberForStorage(phoneCountryIso2, phoneNumber) ||
                  !formatPhoneNumberForStorage(extraPhoneCountryIso2, extraPhoneNumber)
                }
              >
                <Save className="mr-2 h-4 w-4" />
                Speichern
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>E-Mail-Benachrichtigungen</CardTitle>
              <CardDescription>
                Aktivieren oder deaktivieren Sie alle Systemmails.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between rounded-lg border border-border bg-muted/10 p-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Systemmails aktivieren</p>
                  <p className="text-sm text-muted-foreground">
                    Gilt für neue Reservierungen, 3-Tage-Hinweise und 80%-Limit-Warnung.
                  </p>
                </div>
                <Switch
                  checked={emailNotificationsEnabled}
                  onCheckedChange={setEmailNotificationsEnabled}
                />
              </div>
              <div className="space-y-3 rounded-lg border border-border bg-background p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Neue Reservierungen</p>
                    <p className="text-xs text-muted-foreground">
                      E-Mail bei jeder neuen Reservierung.
                    </p>
                  </div>
                  <Switch
                    checked={notifyReservationCreated}
                    onCheckedChange={setNotifyReservationCreated}
                    disabled={!emailNotificationsEnabled}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Zugriff endet in 3 Tagen</p>
                    <p className="text-xs text-muted-foreground">
                      Warnung vor Trial- oder Abo-Ende mit Upgrade-Hinweis.
                    </p>
                  </div>
                  <Switch
                    checked={notifyAccessExpiring3d}
                    onCheckedChange={setNotifyAccessExpiring3d}
                    disabled={!emailNotificationsEnabled}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">80%-Anruflimit erreicht</p>
                    <p className="text-xs text-muted-foreground">
                      Benachrichtigung beim ersten Erreichen pro Monat.
                    </p>
                  </div>
                  <Switch
                    checked={notifyCallLimit80}
                    onCheckedChange={setNotifyCallLimit80}
                    disabled={!emailNotificationsEnabled}
                  />
                </div>
              </div>
              <Button onClick={handleSaveNotifications} disabled={loading}>
                <Save className="mr-2 h-4 w-4" />
                Speichern
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

