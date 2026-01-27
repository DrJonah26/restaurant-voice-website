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
import { toast } from "sonner"
import { Save } from "lucide-react"

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
  const [phoneNumber, setPhoneNumber] = useState("")
  const [callForwarding, setCallForwarding] = useState(false)

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
      setPhoneNumber(restaurantData.phone || "")
      setCallForwarding(restaurantData.call_forwarding || false)
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
    setLoading(true)
    try {
      const { error } = await supabase
        .from("practices")
        .update({
          call_forwarding: callForwarding,
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
                Verwalten Sie Ihre Telefonnummer und Weiterleitung
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Aktuelle Telefonnummer</Label>
                <Input value={phoneNumber} disabled className="bg-muted" />
                <p className="text-xs text-muted-foreground">
                  Die Telefonnummer kann derzeit nicht geändert werden. Kontaktieren Sie den Support.
                </p>
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Weiterleitung aktivieren</Label>
                  <p className="text-sm text-muted-foreground">
                    Anrufe werden an Ihre KI-Assistentin weitergeleitet
                  </p>
                </div>
                <Switch
                  checked={callForwarding}
                  onCheckedChange={setCallForwarding}
                />
              </div>
              <Button onClick={handleSavePhone} disabled={loading}>
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
