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
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { Phone, Calendar, TrendingUp, Star } from "lucide-react"

const COLORS = ["#3B82F6", "#10B981", "#EF4444", "#F59E0B"]

export default function AnalyticsPage() {
  const router = useRouter()
  const [restaurant, setRestaurant] = useState<any>(null)
  const [timeRange, setTimeRange] = useState("week")
  const supabase = createClient()

  // Mock data - in production, fetch from Supabase
  const [stats, setStats] = useState({
    totalCalls: 234,
    successfulBookings: 189,
    missedCalls: 5,
    customerSatisfaction: 4.5,
  })

  const callsOverTime = [
    { date: "Mo", calls: 32 },
    { date: "Di", calls: 28 },
    { date: "Mi", calls: 35 },
    { date: "Do", calls: 41 },
    { date: "Fr", calls: 48 },
    { date: "Sa", calls: 52 },
    { date: "So", calls: 38 },
  ]

  const callResults = [
    { name: "Erfolgreich", value: 189, color: "#10B981" },
    { name: "Verpasst", value: 5, color: "#EF4444" },
    { name: "Abgebrochen", value: 40, color: "#F59E0B" },
  ]

  const peakHours = [
    { hour: "10:00", calls: 12 },
    { hour: "11:00", calls: 18 },
    { hour: "12:00", calls: 25 },
    { hour: "13:00", calls: 22 },
    { hour: "14:00", calls: 15 },
    { hour: "18:00", calls: 28 },
    { hour: "19:00", calls: 35 },
    { hour: "20:00", calls: 32 },
    { hour: "21:00", calls: 18 },
  ]

  const frequentQuestions = [
    { question: "Haben Sie noch einen Tisch frei?", count: 45 },
    { question: "Was ist auf der Speisekarte?", count: 32 },
    { question: "Wie sind Ihre Öffnungszeiten?", count: 28 },
    { question: "Nehmen Sie Reservierungen an?", count: 24 },
    { question: "Haben Sie vegetarische Optionen?", count: 18 },
  ]

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
    }

    loadData()
  }, [router, supabase])

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-muted-foreground mt-2">
            Detaillierte Einblicke in Ihre Anrufe und Reservierungen
          </p>
        </div>
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

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gesamt Anrufe</CardTitle>
            <Phone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCalls}</div>
            <p className="text-xs text-muted-foreground">
              +12% gegenüber letzter Woche
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
              {Math.round((stats.successfulBookings / stats.totalCalls) * 100)}% Erfolgsrate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verpasste Anrufe</CardTitle>
            <Phone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.missedCalls}</div>
            <p className="text-xs text-muted-foreground">
              -5% gegenüber letzter Woche
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kundenzufriedenheit</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.customerSatisfaction}</div>
            <p className="text-xs text-muted-foreground">
              Basierend auf 127 Bewertungen
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Anrufe über Zeit</CardTitle>
            <CardDescription>Anrufvolumen der letzten 7 Tage</CardDescription>
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

        <Card>
          <CardHeader>
            <CardTitle>Anruf-Ergebnisse</CardTitle>
            <CardDescription>Verteilung der Anruf-Ergebnisse</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={callResults}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {callResults.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
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

      {/* Frequent Questions */}
      <Card>
        <CardHeader>
          <CardTitle>Häufigste Fragen</CardTitle>
          <CardDescription>
            Die am häufigsten gestellten Fragen von Anrufern
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {frequentQuestions.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <p className="font-medium">{item.question}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-primary">{item.count}</span>
                  <span className="text-sm text-muted-foreground">Mal</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
