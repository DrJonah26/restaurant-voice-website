"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { Calendar, Phone } from "lucide-react"

export default function AnalyticsPage() {
  const router = useRouter()
  const [timeRange, setTimeRange] = useState("week")
  const supabase = createClient()

  const [stats, setStats] = useState({
    totalCalls: 0,
    successfulBookings: 0,
  })

  const [callsOverTime, setCallsOverTime] = useState<Array<{ date: string; calls: number }>>([])
  const [peakHours, setPeakHours] = useState<Array<{ hour: string; calls: number }>>([])

  const startOfDay = (value: Date) =>
    new Date(value.getFullYear(), value.getMonth(), value.getDate())

  const formatDateKey = (value: Date) => value.toISOString().slice(0, 10)

  const getTimeRangeBounds = () => {
    const now = new Date()
    const end = now
    let start = startOfDay(now)

    if (timeRange === "week") {
      start = startOfDay(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6))
    } else if (timeRange === "month") {
      start = startOfDay(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 29))
    }

    return { start, end }
  }

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

      const { start, end } = getTimeRangeBounds()
      const startIso = start.toISOString()
      const endIso = end.toISOString()

      const [callsResult, reservationsResult, callLogsResult] = await Promise.all([
        supabase
          .from("call_logs")
          .select("id", { count: "exact", head: true })
          .eq("practice_id", restaurantData.id)
          .gte("started_at", startIso)
          .lte("started_at", endIso),
        supabase
          .from("reservations")
          .select("id", { count: "exact", head: true })
          .eq("practice_id", restaurantData.id)
          .in("status", ["confirmed", "completed"])
          .gte("created_at", startIso)
          .lte("created_at", endIso),
        supabase
          .from("call_logs")
          .select("started_at")
          .eq("practice_id", restaurantData.id)
          .gte("started_at", startIso)
          .lte("started_at", endIso),
      ])

      setStats({
        totalCalls: callsResult.count ?? 0,
        successfulBookings: reservationsResult.count ?? 0,
      })

      const dayBuckets = new Map<string, number>()
      const labels: string[] = []
      const dayCursor = new Date(start)
      const formatter =
        timeRange === "week"
          ? new Intl.DateTimeFormat("de-DE", { weekday: "short" })
          : new Intl.DateTimeFormat("de-DE", { day: "2-digit", month: "2-digit" })

      while (dayCursor <= end) {
        const key = formatDateKey(dayCursor)
        dayBuckets.set(key, 0)
        labels.push(key)
        dayCursor.setDate(dayCursor.getDate() + 1)
      }

      const hourBuckets = new Map<number, number>()
      for (let hour = 0; hour < 24; hour += 1) {
        hourBuckets.set(hour, 0)
      }

      callLogsResult.data?.forEach((log) => {
        if (!log.started_at) return
        const createdAt = new Date(log.started_at)
        const dayKey = formatDateKey(createdAt)
        dayBuckets.set(dayKey, (dayBuckets.get(dayKey) ?? 0) + 1)
        const hour = createdAt.getHours()
        hourBuckets.set(hour, (hourBuckets.get(hour) ?? 0) + 1)
      })

      setCallsOverTime(
        labels.map((key) => ({
          date: formatter.format(new Date(key)),
          calls: dayBuckets.get(key) ?? 0,
        }))
      )

      setPeakHours(
        Array.from(hourBuckets.entries()).map(([hour, calls]) => ({
          hour: `${String(hour).padStart(2, "0")}:00`,
          calls,
        }))
      )
    }

    loadData()
  }, [router, supabase, timeRange])

  return (
    <>
      <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-muted-foreground mt-2">
            Detaillierte Einblicke in Ihre Anrufe und Reservierungen
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Heute</SelectItem>
              <SelectItem value="week">Diese Woche</SelectItem>
              <SelectItem value="month">Dieser Monat</SelectItem>
              <SelectItem value="custom">Benutzerdefiniert</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gesamt Anrufe</CardTitle>
            <Phone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCalls}</div>
            <p className="text-xs text-muted-foreground">
              Zeitraum: {timeRange === "today" ? "Heute" : timeRange === "month" ? "Letzte 30 Tage" : "Letzte 7 Tage"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Erfolgreiche Buchungen</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.successfulBookings}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalCalls > 0
                ? `${Math.round((stats.successfulBookings / stats.totalCalls) * 100)}% Erfolgsrate`
                : "Noch keine Anrufe"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-1">
        <Card>
          <CardHeader>
            <CardTitle>Anrufe über Zeit</CardTitle>
            <CardDescription>Anrufvolumen im ausgewählten Zeitraum</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={callsOverTime}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="calls"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  name="Anrufe"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Peak-Zeiten</CardTitle>
          <CardDescription>Anrufvolumen nach Tageszeit</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={peakHours}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="calls" fill="#3B82F6" name="Anrufe" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      </div>
    </>
  )
}
