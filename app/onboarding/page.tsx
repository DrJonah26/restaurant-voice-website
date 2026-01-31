"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { createClient } from "@/lib/supabase/client"
import { TRIAL_CALLS_LIMIT, TRIAL_DURATION_DAYS } from "@/lib/stripe-plans"
import { toast } from "sonner"
import { motion, AnimatePresence } from "framer-motion"
import { useEffect } from "react"
import confetti from "canvas-confetti"
import type { CreateTypes } from "canvas-confetti"

const DAYS = [
  { value: "monday", label: "Montag" },
  { value: "tuesday", label: "Dienstag" },
  { value: "wednesday", label: "Mittwoch" },
  { value: "thursday", label: "Donnerstag" },
  { value: "friday", label: "Freitag" },
  { value: "saturday", label: "Samstag" },
  { value: "sunday", label: "Sonntag" },
]

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [provisioningNumber, setProvisioningNumber] = useState(false)
  const [provisionedNumber, setProvisionedNumber] = useState<string | null>(null)
  const [showGuide, setShowGuide] = useState(false)
  const supabase = createClient()

  // ⬇️ HIER
  useEffect(() => {
    const checkExisting = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      const { data } = await supabase
        .from("practices")
        .select("id, onboarding_completed")
        .eq("user_id", user.id)
        .limit(1)

      if (data && data.length > 0 && data[0].onboarding_completed) {
        router.replace("/dashboard")
      }
    }

    checkExisting()
  }, [router, supabase])


  // Step 1: Welcome
  // Step 2: Restaurant Info
  const [restaurantName, setRestaurantName] = useState("")
  const [restaurantEmail, setRestaurantEmail] = useState("")
  const [restaurantPhone, setRestaurantPhone] = useState("")

  // Step 3: Hours & Capacity
  const [openingTime, setOpeningTime] = useState("09:00")
  const [closingTime, setClosingTime] = useState("22:00")
  const [maxCapacity, setMaxCapacity] = useState([50])
  const [closedDays, setClosedDays] = useState<string[]>([])

  const totalSteps = 4
  const progress = (step / totalSteps) * 100

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1)
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  const handleDayToggle = (day: string) => {
    setClosedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    )
  }

  const handleFinish = async () => {
    setLoading(true)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        throw new Error("Nicht angemeldet")
      }

      // Save restaurant data to Supabase
      const { data, error } = await supabase
        .from("practices")
        .upsert(
          {
            user_id: user.id,
            name: restaurantName,
            email: restaurantEmail,
            phone_number: restaurantPhone,
            opening_time: openingTime,
            closing_time: closingTime,
            max_capacity: maxCapacity[0],
            closed_days: closedDays,
            onboarding_completed: false,
          },
          { onConflict: "user_id" }
        )
        .select("id")
        .single()

      if (error || !data?.id) throw error ?? new Error("Practice-ID fehlt")

      setProvisioningNumber(true)
      const response = await fetch("/api/provision-number", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          practiceId: data.id,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.details || result.error || "Fehler beim Einrichten der Telefonnummer")
      }

      setProvisionedNumber(result.phoneNumber ?? null)

      const trialStart = new Date()
      const trialEnd = new Date(
        trialStart.getTime() + TRIAL_DURATION_DAYS * 24 * 60 * 60 * 1000
      )

      const { error: completionError } = await supabase
        .from("practices")
        .update({
          onboarding_completed: true,
          subscription_plan: "trial",
          trial_started_at: trialStart.toISOString(),
          trial_ends_at: trialEnd.toISOString(),
          calls_limit: TRIAL_CALLS_LIMIT,
        })
        .eq("user_id", user.id)

      if (completionError) throw completionError

      setShowGuide(true)
      setLoading(false)
      setProvisioningNumber(false)

      // Trigger confetti
      if (typeof window !== "undefined") {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        })
      }

      toast.success(`Onboarding abgeschlossen! Nummer: ${result.phoneNumber}`)
    } catch (error: any) {
      toast.error(error.message || "Fehler beim Speichern")
      setLoading(false)
      setProvisioningNumber(false)
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

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(1600px_820px_at_50%_40%,_rgba(253,224,71,0.25),_transparent_70%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(1000px_520px_at_60%_60%,_rgba(250,204,21,0.18),_transparent_72%)]" />
      </div>
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl border border-border shadow-sm">
        <CardHeader>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl">Onboarding</CardTitle>
              <span className="text-sm text-muted-foreground">
                Schritt {step} von {totalSteps}
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </CardHeader>
        <CardContent>
          <AnimatePresence mode="wait">
            {/* Step 1: Welcome */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6 text-center py-8"
              >
                <h2 className="text-3xl font-bold">Willkommen!</h2>
                <p className="text-muted-foreground text-lg">
                  Wir helfen Ihnen dabei, Ihr Restaurant in wenigen Minuten einzurichten.
                  Lassen Sie uns gemeinsam loslegen!
                </p>
                <Button onClick={handleNext} size="lg" className="mt-8">
                  Los geht&apos;s
                </Button>
              </motion.div>
            )}

            {/* Step 2: Restaurant Info */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-2xl font-bold mb-2">Restaurant-Informationen</h2>
                  <p className="text-muted-foreground">
                    Geben Sie uns einige grundlegende Informationen über Ihr Restaurant.
                  </p>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="restaurantName">Restaurant Name *</Label>
                    <Input
                      id="restaurantName"
                      value={restaurantName}
                      onChange={(e) => setRestaurantName(e.target.value)}
                      placeholder="Mein Restaurant"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="restaurantEmail">E-Mail *</Label>
                    <Input
                      id="restaurantEmail"
                      type="email"
                      value={restaurantEmail}
                      onChange={(e) => setRestaurantEmail(e.target.value)}
                      placeholder="restaurant@beispiel.de"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="restaurantPhone">Telefon *</Label>
                    <Input
                      id="restaurantPhone"
                      type="tel"
                      value={restaurantPhone}
                      onChange={(e) => setRestaurantPhone(e.target.value)}
                      placeholder="+49 30 1234 5678"
                      required
                    />
                  </div>
                </div>
                <div className="flex gap-4">
                  <Button variant="outline" onClick={handleBack} className="flex-1">
                    Zurück
                  </Button>
                  <Button
                    onClick={handleNext}
                    className="flex-1"
                    disabled={!restaurantName || !restaurantEmail || !restaurantPhone}
                  >
                    Weiter
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Hours & Capacity */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-2xl font-bold mb-2">Öffnungszeiten & Kapazität</h2>
                  <p className="text-muted-foreground">
                    Konfigurieren Sie die Öffnungszeiten und die maximale Kapazität.
                  </p>
                </div>
                <div className="space-y-6">
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
                    <Label>Maximale Kapazität: {maxCapacity[0]} Personen</Label>
                    <Slider
                      value={maxCapacity}
                      onValueChange={setMaxCapacity}
                      min={10}
                      max={200}
                      step={5}
                    />
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
                </div>
                <div className="flex gap-4">
                  <Button variant="outline" onClick={handleBack} className="flex-1">
                    Zurück
                  </Button>
                  <Button onClick={handleNext} className="flex-1">
                    Weiter
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Step 4: Summary */}
            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-2xl font-bold mb-2">Fertig!</h2>
                  <p className="text-muted-foreground">
                    Überprüfen Sie Ihre Angaben und schließen Sie das Onboarding ab.
                  </p>
                </div>
                <Card>
                  <CardHeader>
                    <CardTitle>Zusammenfassung</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm font-semibold text-muted-foreground">Restaurant Name</p>
                      <p className="text-lg">{restaurantName}</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-muted-foreground">E-Mail</p>
                      <p className="text-lg">{restaurantEmail}</p>
                    </div>
                    {restaurantPhone && (
                      <div>
                        <p className="text-sm font-semibold text-muted-foreground">Telefon</p>
                        <p className="text-lg">{restaurantPhone}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-semibold text-muted-foreground">Öffnungszeiten</p>
                      <p className="text-lg">
                        {openingTime} - {closingTime} Uhr
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-muted-foreground">Maximale Kapazität</p>
                      <p className="text-lg">{maxCapacity[0]} Personen</p>
                    </div>
                    {closedDays.length > 0 && (
                      <div>
                        <p className="text-sm font-semibold text-muted-foreground">Geschlossene Tage</p>
                        <p className="text-lg">
                          {closedDays
                            .map((d) => DAYS.find((day) => day.value === d)?.label)
                            .join(", ")}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
                {showGuide && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Anleitung zur Weiterleitung einer Telefonnummer</CardTitle>
                      <CardDescription>
                        Geben Sie die untenstehenden Tastenkombinationen auf Ihrem Gerät ein.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <p className="text-sm font-semibold text-muted-foreground">Zielnummer</p>
                        <div className="flex items-center gap-3">
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
                      <div className="rounded-md border border-border bg-muted/40 p-3 text-sm">
                        <div className="font-medium">Für alle Anrufe</div>
                        <div>**21*Zielnummer#</div>
                      </div>
                      <div className="rounded-md border border-border bg-muted/40 p-3 text-sm">
                        <div className="font-medium">Nur bei nicht besetzt</div>
                        <div>**67*Zielnummer#</div>
                      </div>
                      <div className="rounded-md border border-border bg-muted/40 p-3 text-sm">
                        <div className="font-medium">Nur bei nicht melden</div>
                        <div>**61*Zielnummer#</div>
                      </div>
                      <div className="rounded-md border border-border bg-muted/40 p-3 text-sm">
                        <div className="font-medium">Deaktivieren</div>
                        <div>##21#</div>
                      </div>
                    </CardContent>
                  </Card>
                )}
                <div className="flex gap-4">
                  <Button variant="outline" onClick={handleBack} className="flex-1">
                    Zurück
                  </Button>
                  {showGuide ? (
                    <Button onClick={() => router.push("/dashboard")} className="flex-1">
                      Dashboard oeffnen
                    </Button>
                  ) : (
                    <Button onClick={handleFinish} className="flex-1" disabled={loading}>
                    {loading
                      ? provisioningNumber
                        ? "📞 Telefonnummer wird eingerichtet..."
                        : "Wird gespeichert..."
                      : "Dashboard öffnen"}
                  </Button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
        </Card>
      </div>
    </div>
  )
}
