"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Plus, Search, MoreVertical, Phone, X, Eye } from "lucide-react"
import { formatDate, formatTime } from "@/lib/utils"
import { toast } from "sonner"

export default function ReservationsPage() {
  const router = useRouter()
  const [restaurant, setRestaurant] = useState<any>(null)
  const [reservations, setReservations] = useState<any[]>([])
  const [filteredReservations, setFilteredReservations] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [dateFilter, setDateFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [pageSize, setPageSize] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)
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

      // Fetch reservations
      const { data: reservationsData } = await supabase
        .from("reservations")
        .select("*")
        .eq("practice_id", restaurantData.id)
        .order("date", { ascending: false })
        .order("time", { ascending: false })

      setReservations(reservationsData || [])
      setFilteredReservations(reservationsData || [])
    }

    loadData()
  }, [router, supabase])

  useEffect(() => {
    let filtered = [...reservations]

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (r) =>
          r.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.phone_number?.includes(searchQuery)
      )
    }

    // Date filter
    if (dateFilter !== "all") {
      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const weekStart = new Date(today)
      weekStart.setDate(today.getDate() - today.getDay())

      filtered = filtered.filter((r) => {
        const resDate = new Date(`${r.date}T${r.time || "00:00:00"}`)
        switch (dateFilter) {
          case "today":
            return resDate >= today
          case "week":
            return resDate >= weekStart
          default:
            return true
        }
      })
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((r) => r.status === statusFilter)
    }

    setFilteredReservations(filtered)
    setCurrentPage(1)
  }, [searchQuery, dateFilter, statusFilter, reservations])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return <Badge variant="success">Bestätigt</Badge>
      case "cancelled":
        return <Badge variant="destructive">Abgesagt</Badge>
      case "completed":
        return <Badge>Abgeschlossen</Badge>
      case "no_show":
        return <Badge variant="warning">Nicht erschienen</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const handleCancelReservation = async (id: string) => {
    try {
      const { error } = await supabase
        .from("reservations")
        .update({ status: "cancelled" })
        .eq("id", id)

      if (error) throw error

      toast.success("Reservierung abgesagt")
      
      // Refresh data
      const { data: reservationsData } = await supabase
        .from("reservations")
        .select("*")
        .eq("practice_id", restaurant.id)
        .order("date", { ascending: false })
        .order("time", { ascending: false })

      setReservations(reservationsData || [])
    } catch (error: any) {
      toast.error(error.message || "Fehler beim Absagen")
    }
  }

  const paginatedReservations = filteredReservations.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  )
  const totalPages = Math.ceil(filteredReservations.length / pageSize)

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Reservierungen</h1>
          <p className="text-muted-foreground mt-2">
            Verwalten Sie alle Ihre Tischreservierungen
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Neue Reservierung
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter & Suche</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Nach Name oder Telefon suchen..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Zeitraum" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle</SelectItem>
                <SelectItem value="today">Heute</SelectItem>
                <SelectItem value="week">Diese Woche</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Status</SelectItem>
                <SelectItem value="confirmed">Bestätigt</SelectItem>
                <SelectItem value="cancelled">Abgesagt</SelectItem>
                <SelectItem value="completed">Abgeschlossen</SelectItem>
                <SelectItem value="no_show">Nicht erschienen</SelectItem>
              </SelectContent>
            </Select>
            <Select value={pageSize.toString()} onValueChange={(v) => setPageSize(Number(v))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10 pro Seite</SelectItem>
                <SelectItem value="25">25 pro Seite</SelectItem>
                <SelectItem value="50">50 pro Seite</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Reservations Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Reservierungen ({filteredReservations.length})
          </CardTitle>
          <CardDescription>
            {filteredReservations.length === 0
              ? "Keine Reservierungen gefunden"
              : `${paginatedReservations.length} von ${filteredReservations.length} angezeigt`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {paginatedReservations.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              Keine Reservierungen gefunden
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-4 font-medium">Datum</th>
                      <th className="text-left p-4 font-medium">Zeit</th>
                      <th className="text-left p-4 font-medium">Name</th>
                      <th className="text-left p-4 font-medium">Telefon</th>
                      <th className="text-left p-4 font-medium">Personen</th>
                      <th className="text-left p-4 font-medium">Status</th>
                      <th className="text-right p-4 font-medium">Aktionen</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedReservations.map((reservation) => (
                      <tr key={reservation.id} className="border-b hover:bg-muted/50">
                        <td className="p-4">{formatDate(reservation.date)}</td>
                        <td className="p-4">
                          {formatTime(
                            `${reservation.date}T${reservation.time || "00:00:00"}`
                          )}
                        </td>
                        <td className="p-4 font-medium">{reservation.customer_name}</td>
                        <td className="p-4">{reservation.phone_number}</td>
                        <td className="p-4">{reservation.party_size}</td>
                        <td className="p-4">{getStatusBadge(reservation.status)}</td>
                        <td className="p-4">
                          <div className="flex justify-end">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                  <Eye className="mr-2 h-4 w-4" />
                                  Details
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Phone className="mr-2 h-4 w-4" />
                                  Anrufen
                                </DropdownMenuItem>
                                {reservation.status !== "cancelled" && (
                                  <DropdownMenuItem
                                    onClick={() => handleCancelReservation(reservation.id)}
                                    className="text-destructive"
                                  >
                                    <X className="mr-2 h-4 w-4" />
                                    Absagen
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-muted-foreground">
                    Seite {currentPage} von {totalPages}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      Zurück
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Weiter
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
