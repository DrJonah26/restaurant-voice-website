"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
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

type CallLog = {
  id: string
  started_at: string
  ended_at: string | null
  duration_seconds: number | null
  status: string
  stream_sid: string | null
}

type CallTranscript = {
  id: string
  role: string
  content: string
  created_at: string
}

export default function AnalyticsPage() {
  const router = useRouter()
  const [timeRange, setTimeRange] = useState("week")
  const supabase = createClient()
  const [practiceId, setPracticeId] = useState<string | null>(null)

  const [stats, setStats] = useState({
    totalCalls: 0,
    successfulBookings: 0,
  })

  const [callsOverTime, setCallsOverTime] = useState<Array<{ date: string; calls: number }>>([])
  const [peakHours, setPeakHours] = useState<Array<{ hour: string; calls: number }>>([])
  const [isCallLogsOpen, setIsCallLogsOpen] = useState(false)
  const [callLogs, setCallLogs] = useState<CallLog[]>([])
  const [isCallLogsLoading, setIsCallLogsLoading] = useState(false)
  const [selectedCallId, setSelectedCallId] = useState<string | null>(null)
  const [callTranscripts, setCallTranscripts] = useState<CallTranscript[]>([])
  const [isTranscriptsLoading, setIsTranscriptsLoading] = useState(false)

  const selectedCall = useMemo(
    () => callLogs.find((log) => log.id === selectedCallId) ?? null,
    [callLogs, selectedCallId]
  )

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

      setPracticeId(restaurantData.id)

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
          .eq("practice_id", practiceId)
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

  useEffect(() => {
    if (!isCallLogsOpen || !practiceId) return

    const loadCallLogs = async () => {
      setIsCallLogsLoading(true)
      const { data } = await supabase
        .from("call_logs")
        .select("id, started_at, ended_at, duration_seconds, status, stream_sid")
        .eq("practice_id", practiceId)
        .order("started_at", { ascending: false })

      setCallLogs(data ?? [])
      setSelectedCallId((current) => current ?? data?.[0]?.id ?? null)
      setIsCallLogsLoading(false)
    }

    loadCallLogs()
  }, [isCallLogsOpen, practiceId, supabase])

  useEffect(() => {
    if (!selectedCallId) return

    const loadTranscripts = async () => {
      setIsTranscriptsLoading(true)
      const { data } = await supabase
        .from("call_transcripts")
        .select("id, role, content, created_at")
        .eq("call_log_id", selectedCallId)
        .order("created_at", { ascending: true })

      setCallTranscripts(data ?? [])
      setIsTranscriptsLoading(false)
    }

    loadTranscripts()
  }, [selectedCallId, supabase])

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
          <Button variant="outline" onClick={() => setIsCallLogsOpen(true)}>
            Call-Logs ansehen
          </Button>
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

      {isCallLogsOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="flex max-h-[85vh] w-full max-w-5xl flex-col overflow-hidden rounded-lg bg-background shadow-xl">
            <div className="flex items-center justify-between border-b px-6 py-4">
              <div>
                <h2 className="text-xl font-semibold">Call-Logs</h2>
                <p className="text-sm text-muted-foreground">
                  Wählen Sie einen Anruf aus, um Details und Transkripte zu sehen.
                </p>
              </div>
              <Button variant="ghost" onClick={() => setIsCallLogsOpen(false)}>
                Schließen
              </Button>
            </div>
            <div className="grid flex-1 gap-0 overflow-hidden md:grid-cols-[280px_1fr]">
              <div className="border-b md:border-b-0 md:border-r">
                <div className="p-4 text-sm font-medium text-muted-foreground">Alle Anrufe</div>
                <div className="max-h-[60vh] overflow-y-auto px-2 pb-4">
                  {isCallLogsLoading ? (
                    <div className="px-4 py-6 text-sm text-muted-foreground">Lade Call-Logs…</div>
                  ) : callLogs.length === 0 ? (
                    <div className="px-4 py-6 text-sm text-muted-foreground">
                      Noch keine Call-Logs vorhanden.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {callLogs.map((log) => {
                        const label = new Intl.DateTimeFormat("de-DE", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        }).format(new Date(log.started_at))

                        return (
                          <button
                            key={log.id}
                            type="button"
                            onClick={() => setSelectedCallId(log.id)}
                            className={`w-full rounded-md px-3 py-2 text-left text-sm transition hover:bg-accent ${
                              selectedCallId === log.id
                                ? "bg-accent text-accent-foreground"
                                : "text-foreground"
                            }`}
                          >
                            <div className="font-medium">{label}</div>
                            <div className="text-xs text-muted-foreground">Status: {log.status}</div>
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-4 p-6">
                {selectedCall ? (
                  <>
                    <div className="space-y-1">
                      <h3 className="text-lg font-semibold">Anrufdetails</h3>
                      <p className="text-sm text-muted-foreground">
                        {new Intl.DateTimeFormat("de-DE", {
                          dateStyle: "full",
                          timeStyle: "short",
                        }).format(new Date(selectedCall.started_at))}
                      </p>
                    </div>
                    <div className="grid gap-3 text-sm sm:grid-cols-2">
                      <div>
                        <div className="text-muted-foreground">Status</div>
                        <div className="font-medium capitalize">{selectedCall.status}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Dauer</div>
                        <div className="font-medium">
                          {selectedCall.duration_seconds
                            ? `${Math.round(selectedCall.duration_seconds / 60)} Min`
                            : "-"}
                        </div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Beginn</div>
                        <div className="font-medium">
                          {new Intl.DateTimeFormat("de-DE", {
                            dateStyle: "medium",
                            timeStyle: "short",
                          }).format(new Date(selectedCall.started_at))}
                        </div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Ende</div>
                        <div className="font-medium">
                          {selectedCall.ended_at
                            ? new Intl.DateTimeFormat("de-DE", {
                                dateStyle: "medium",
                                timeStyle: "short",
                              }).format(new Date(selectedCall.ended_at))
                            : "-"}
                        </div>
                      </div>
                      <div className="sm:col-span-2">
                        <div className="text-muted-foreground">Stream SID</div>
                        <div className="font-medium break-all">
                          {selectedCall.stream_sid ?? "-"}
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <h4 className="text-base font-semibold">Transkript</h4>
                      <div className="max-h-[36vh] space-y-3 overflow-y-auto rounded-md border bg-muted/30 p-4">
                        {isTranscriptsLoading ? (
                          <div className="text-sm text-muted-foreground">Lade Transkript…</div>
                        ) : callTranscripts.length === 0 ? (
                          <div className="text-sm text-muted-foreground">
                            Noch kein Transkript verfügbar.
                          </div>
                        ) : (
                          callTranscripts.map((line) => (
                            <div key={line.id} className="text-sm">
                              <div className="text-xs uppercase text-muted-foreground">
                                {line.role}
                              </div>
                              <p className="text-foreground">{line.content}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-sm text-muted-foreground">
                    Wählen Sie einen Anruf aus der Liste, um Details zu sehen.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}
