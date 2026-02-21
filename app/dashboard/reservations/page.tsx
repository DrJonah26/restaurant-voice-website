"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
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
  const [hidePast, setHidePast] = useState(true)
  const [pageSize, setPageSize] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)
  const [isHydrated, setIsHydrated] = useState(false)
  const supabase = createClient()

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [newReservation, setNewReservation] = useState({
    customer_name: "",
    phone_number: "",
    date: "",
    time: "",
    party_size: "",
    notes: "",
    status: "confirmed",
  })

  useEffect(() => {
    setIsHydrated(true)
  }, [])

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
    const now = new Date()

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (r) =>
          r.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.phone_number?.includes(searchQuery)
      )
    }

    // Hide past reservations
    if (hidePast) {
      filtered = filtered.filter((r) => {
        const resDate = new Date(`${r.date}T${r.time || "00:00:00"}`)
        return resDate >= now
      })
    }

    // Date filter
    if (dateFilter !== "all") {
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
  }, [searchQuery, dateFilter, statusFilter, hidePast, reservations])

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

  const handleCreateReservation = async () => {
    if (!newReservation.customer_name || !newReservation.date || !newReservation.time || !newReservation.party_size) {
      toast.error("Bitte füllen Sie alle Pflichtfelder aus")
      return
    }

    setIsSubmitting(true)
    try {
      const { error } = await supabase.from("reservations").insert({
        practice_id: restaurant.id,
        customer_name: newReservation.customer_name,
        phone_number: newReservation.phone_number || null,
        date: newReservation.date,
        time: newReservation.time + ":00",
        party_size: parseInt(newReservation.party_size),
        notes: newReservation.notes || null,
        status: newReservation.status,
      })

      if (error) throw error

      toast.success("Reservierung erfolgreich erstellt")
      setIsModalOpen(false)
      setNewReservation({
        customer_name: "",
        phone_number: "",
        date: "",
        time: "",
        party_size: "",
        notes: "",
        status: "confirmed",
      })

      // Refresh data
      const { data: reservationsData } = await supabase
        .from("reservations")
        .select("*")
        .eq("practice_id", restaurant.id)
        .order("date", { ascending: false })
        .order("time", { ascending: false })

      setReservations(reservationsData || [])
    } catch (error: any) {
      toast.error(error.message || "Fehler beim Erstellen der Reservierung")
    } finally {
      setIsSubmitting(false)
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
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Neue Reservierung
        </Button>
      </div>

      {/* Modal: Neue Reservierung */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Neue Reservierung</DialogTitle>
            <DialogDescription>
              Füllen Sie die Daten für die neue Reservierung aus. Pflichtfelder sind mit * markiert.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="customer_name">Name *</Label>
              <Input
                id="customer_name"
                placeholder="Vor- und Nachname"
                value={newReservation.customer_name}
                onChange={(e) =>
                  setNewReservation((prev) => ({ ...prev, customer_name: e.target.value }))
                }
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="phone_number">Telefonnummer</Label>
              <Input
                id="phone_number"
                placeholder="+49 123 456789"
                value={newReservation.phone_number}
                onChange={(e) =>
                  setNewReservation((prev) => ({ ...prev, phone_number: e.target.value }))
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="date">Datum *</Label>
                <Input
                  id="date"
                  type="date"
                  value={newReservation.date}
                  onChange={(e) =>
                    setNewReservation((prev) => ({ ...prev, date: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="time">Uhrzeit *</Label>
                <Input
                  id="time"
                  type="time"
                  value={newReservation.time}
                  onChange={(e) =>
                    setNewReservation((prev) => ({ ...prev, time: e.target.value }))
                  }
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="party_size">Anzahl Personen *</Label>
              <Input
                id="party_size"
                type="number"
                min="1"
                max="50"
                placeholder="2"
                value={newReservation.party_size}
                onChange={(e) =>
                  setNewReservation((prev) => ({ ...prev, party_size: e.target.value }))
                }
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="status">Status</Label>
              <Select
                value={newReservation.status}
                onValueChange={(v) =>
                  setNewReservation((prev) => ({ ...prev, status: v }))
                }
              >
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="confirmed">Bestätigt</SelectItem>
                  <SelectItem value="cancelled">Abgesagt</SelectItem>
                  <SelectItem value="completed">Abgeschlossen</SelectItem>
                  <SelectItem value="no_show">Nicht erschienen</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="notes">Anmerkungen</Label>
              <Input
                id="notes"
                placeholder="Geburtstag, Allergie, Sonderwunsch..."
                value={newReservation.notes}
                onChange={(e) =>
                  setNewReservation((prev) => ({ ...prev, notes: e.target.value }))
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)} disabled={isSubmitting}>
              Abbrechen
            </Button>
            <Button onClick={handleCreateReservation} disabled={isSubmitting}>
              {isSubmitting ? "Wird gespeichert..." : "Reservierung erstellen"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter & Suche</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-5">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Nach Name oder Telefon suchen..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-background border-input backdrop-blur-0 pr-9"
              />
            </div>
            <div className="flex h-10 items-center justify-between gap-3 rounded-md border border-input bg-background px-3">
              <span className="text-sm text-muted-foreground">Vergangene ausblenden</span>
              <Switch checked={hidePast} onCheckedChange={setHidePast} />
            </div>
            {isHydrated ? (
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
            ) : (
              <div className="h-10 w-full rounded-md border border-input bg-background" />
            )}
            {isHydrated ? (
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
            ) : (
              <div className="h-10 w-full rounded-md border border-input bg-background" />
            )}
            {isHydrated ? (
              <Select
                value={pageSize.toString()}
                onValueChange={(v) => setPageSize(Number(v))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10 pro Seite</SelectItem>
                  <SelectItem value="25">25 pro Seite</SelectItem>
                  <SelectItem value="50">50 pro Seite</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <div className="h-10 w-full rounded-md border border-input bg-background" />
            )}
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
