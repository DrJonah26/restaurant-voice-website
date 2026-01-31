"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Phone, Calendar } from "lucide-react"
import Link from "next/link"
import { formatDate, formatDateTime } from "@/lib/utils"
import { TRIAL_DURATION_DAYS } from "@/lib/stripe-plans"

const toDateString = (value: Date) => {
  const year = value.getFullYear()
  const month = String(value.getMonth() + 1).padStart(2, "0")
  const day = String(value.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

export default function DashboardPage() {
  const router = useRouter()
  const [restaurant, setRestaurant] = useState<any>(null)
  const [stats, setStats] = useState({
    callsToday: 0,
    callsThisMonth: 0,
    reservationsToday: 0,
    reservationsThisMonth: 0,
  })
  const [trialDaysLeft, setTrialDaysLeft] = useState<number | null>(null)
  const [trialEndDate, setTrialEndDate] = useState<Date | null>(null)
  const [recentReservations, setRecentReservations] = useState<any[]>([])
  const supabase = createClient()

  useEffect(() => {
    const loadData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/auth/login")
        return
      }

      // Fetch restaurant
      const { data: practices, error } = await supabase
        .from("practices")
        .select("*")
        .eq("user_id", user.id)
        .single()

      if (error || !practices || practices.length === 0) {
        router.push("/onboarding")
        console.log("No practice found for user:", error)
        return
      }

      const now = new Date()
      setRestaurant(practices)
      let trialEnd: Date | null = null
      if (practices.subscription_plan === "trial") {
        if (practices.trial_ends_at) {
          trialEnd = new Date(practices.trial_ends_at)
        } else if (practices.trial_started_at) {
          trialEnd = new Date(practices.trial_started_at)
          trialEnd.setDate(trialEnd.getDate() + TRIAL_DURATION_DAYS)
        }
      }

      if (trialEnd) {
        const msLeft = trialEnd.getTime() - now.getTime()
        const daysLeft = Math.max(0, Math.ceil(msLeft / (24 * 60 * 60 * 1000)))
        setTrialDaysLeft(daysLeft)
        setTrialEndDate(trialEnd)
      } else {
        setTrialDaysLeft(null)
        setTrialEndDate(null)
      }
      const practiceId = practices.practice_id ?? practices.id
      const todayStart = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate()
      )
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
      const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)
      const todayDate = toDateString(todayStart)
      const monthStartDate = toDateString(monthStart)
      const monthEndDate = toDateString(monthEnd)

      const [
        callsTodayResult,
        callsMonthResult,
        reservationsTodayResult,
        reservationsMonthResult,
        recentReservationsResult,
      ] = await Promise.all([
        supabase
          .from("call_logs")
          .select("id", { count: "exact", head: true })
          .eq("practice_id", practiceId)
          .gte("started_at", todayStart.toISOString())
          .lte("started_at", now.toISOString()),
        supabase
          .from("call_logs")
          .select("id", { count: "exact", head: true })
          .eq("practice_id", practiceId)
          .gte("started_at", monthStart.toISOString())
          .lte("started_at", monthEnd.toISOString()),
        supabase
          .from("reservations")
          .select("id", { count: "exact", head: true })
          .eq("practice_id", practiceId)
          .eq("date", todayDate),
        supabase
          .from("reservations")
          .select("id", { count: "exact", head: true })
          .eq("practice_id", practiceId)
          .gte("date", monthStartDate)
          .lte("date", monthEndDate),
        supabase
          .from("reservations")
          .select("*")
          .eq("practice_id", practiceId)
          .order("date", { ascending: false })
          .order("time", { ascending: false })
          .limit(5),
      ])

      setStats({
        callsToday: callsTodayResult.count ?? 0,
        callsThisMonth: callsMonthResult.count ?? 0,
        reservationsToday: reservationsTodayResult.count ?? 0,
        reservationsThisMonth: reservationsMonthResult.count ?? 0,
      })

      setRecentReservations(recentReservationsResult.data || [])
    }

    loadData()
  }, [router, supabase])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return <Badge variant="success">Bestätigt</Badge>
      case "cancelled":
        return <Badge variant="destructive">Abgesagt</Badge>
      case "completed":
        return <Badge variant="secondary">Abgeschlossen</Badge>
      case "no_show":
        return <Badge variant="warning">Nicht erschienen</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  return (
    <div className="space-y-8">
      {/* Welcome Message */}
      <div>
        <h1 className="text-3xl font-bold">
          Willkommen zurück, {restaurant?.name || "Restaurant"}!
        </h1>
        <p className="text-muted-foreground mt-2">
          Hier ist eine Übersicht über Ihre Aktivitäten.
        </p>
      </div>

      {trialDaysLeft !== null && (
        <Card className="border-primary/40 bg-primary/5">
          <CardHeader>
            <CardTitle>Testphase aktiv</CardTitle>
            <CardDescription>
              Noch {trialDaysLeft} {trialDaysLeft === 1 ? "Tag" : "Tage"} im
              kostenlosen Test.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="text-sm text-muted-foreground">
              {trialEndDate ? `Endet am ${formatDate(trialEndDate)}.` : null}
            </div>
            <Link href="/dashboard/billing">
              <Button>Plan auswählen</Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Anrufe heute</CardTitle>
            <Phone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.callsToday}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <span>Heute</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Anrufe diesen Monat</CardTitle>
            <Phone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.callsThisMonth}
              {restaurant?.calls_limit ? ` / ${restaurant.calls_limit}` : ""}
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              {restaurant?.calls_limit
                ? "Monatslimit"
                : "Kein Limit gesetzt"}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reservierungen heute</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.reservationsToday}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <span>Für heute geplant</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reservierungen diesen Monat</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.reservationsThisMonth}
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              <span>Im aktuellen Monat</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Reservations */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Letzte Reservierungen</CardTitle>
              <CardDescription>
                Die neuesten Buchungen in Ihrem System
              </CardDescription>
            </div>
            <Link href="/dashboard/reservations">
              <Button variant="outline" size="sm">
                Alle anzeigen
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {recentReservations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Noch keine Reservierungen vorhanden
            </div>
          ) : (
            <div className="space-y-4">
              <div className="hidden md:grid md:grid-cols-5 gap-4 text-sm font-medium text-muted-foreground pb-2 border-b">
                <div>Zeit</div>
                <div>Name</div>
                <div>Telefon</div>
                <div>Personen</div>
                <div>Status</div>
              </div>
              {recentReservations.map((reservation) => {
                const reservationDateTime = `${reservation.date}T${
                  reservation.time || "00:00:00"
                }`
                return (
                  <div
                    key={reservation.id}
                    className="grid md:grid-cols-5 gap-4 items-center py-3 border-b last:border-0"
                  >
                    <div className="text-sm">
                      {formatDateTime(reservationDateTime)}
                    </div>
                    <div className="font-medium">{reservation.customer_name}</div>
                    <div className="text-sm text-muted-foreground">
                      {reservation.phone_number}
                    </div>
                    <div className="text-sm">{reservation.party_size} Personen</div>
                    <div>{getStatusBadge(reservation.status)}</div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

    </div>
  )
}
