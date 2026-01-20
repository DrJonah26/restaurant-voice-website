"use client"


import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Check, Download, CreditCard, AlertCircle } from "lucide-react"
import { STRIPE_PLANS } from "@/lib/stripe-plans"
import { toast } from "sonner"
import Link from "next/link"
import { formatDate } from "@/lib/utils"

const stripePlanBySubscriptionPlan = {
  trial: "basic",
  starter: "basic",
  pro: "professional",
  enterprise: "custom",
} as const

const getStripePlanKey = (subscriptionPlan?: string | null) => {
  if (!subscriptionPlan) return "basic"
  return (
    stripePlanBySubscriptionPlan[
      subscriptionPlan as keyof typeof stripePlanBySubscriptionPlan
    ] || "basic"
  )
}

export default function BillingPage() {
  const router = useRouter()
  const [restaurant, setRestaurant] = useState<any>(null)
  const [currentPlan, setCurrentPlan] = useState("basic")
  const [usage, setUsage] = useState({ calls: 234, limit: 300 })
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  // Mock invoice data
  const invoices = [
    {
      id: "inv_001",
      date: "2024-01-15",
      description: "Basic Plan - Januar 2024",
      amount: 30,
      status: "paid",
    },
    {
      id: "inv_002",
      date: "2023-12-15",
      description: "Basic Plan - Dezember 2023",
      amount: 30,
      status: "paid",
    },
    {
      id: "inv_003",
      date: "2023-11-15",
      description: "Basic Plan - November 2023",
      amount: 30,
      status: "paid",
    },
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
      const planKey = getStripePlanKey(restaurantData.subscription_plan)
      setCurrentPlan(planKey)
      setUsage({
        calls: restaurantData.calls_this_month || 0,
        limit:
          restaurantData.calls_limit ??
          STRIPE_PLANS[planKey as keyof typeof STRIPE_PLANS].calls,
      })
    }

    loadData()
  }, [router, supabase])

  const plan = STRIPE_PLANS[currentPlan as keyof typeof STRIPE_PLANS]
  const usagePercentage =
    usage.limit > 0 ? (usage.calls / usage.limit) * 100 : 0

const handleUpgrade = async (planKey: string) => {
    setLoading(true)
    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planKey }),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data?.error || "Fehler beim Upgrade")
      }

      if (data?.url) {
        window.location.href = data.url
        return
      }

      throw new Error("Stripe Checkout URL fehlt")
    } catch (error: any) {
      toast.error(error.message || "Fehler beim Upgrade")
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = async () => {
    if (!confirm("Möchten Sie Ihr Abonnement wirklich kündigen?")) return

    setLoading(true)
    try {
      // In production, cancel Stripe subscription
      toast.info("Abo wird gekündigt...")
    } catch (error: any) {
      toast.error(error.message || "Fehler beim Kündigen")
    } finally {
      setLoading(false)
    }
  }

  const handleManagePayment = async () => {
    try {
      const response = await fetch("/api/stripe/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data?.error || "Fehler beim ?ffnen des Portals")
      }

      if (data?.url) {
        window.location.href = data.url
        return
      }

      throw new Error("Stripe Portal URL fehlt")
    } catch (error: any) {
      toast.error(error.message || "Fehler beim ?ffnen des Portals")
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Abrechnung</h1>
        <p className="text-muted-foreground mt-2">
          Verwalten Sie Ihr Abonnement und Zahlungsmethoden
        </p>
      </div>

      {/* Current Plan */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Aktueller Plan</CardTitle>
              <CardDescription>
                {plan.name} Plan - {plan.price === 0 ? "Kostenlos" : `${plan.price}€/Monat`}
              </CardDescription>
            </div>
            <Badge variant={currentPlan === "professional" ? "default" : "secondary"}>
              {currentPlan === "professional" ? "Empfohlen" : "Aktiv"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Anrufe</span>
              <span className="text-sm text-muted-foreground">
                {usage.calls} / {usage.limit}
              </span>
            </div>
            <Progress value={usagePercentage} className="h-2" />
            {usagePercentage > 80 && (
              <p className="text-xs text-yellow-600 mt-2 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                Sie nähern sich Ihrem Limit. Erwägen Sie ein Upgrade.
              </p>
            )}
          </div>
          <div>
            <h4 className="font-semibold mb-3">Plan-Features:</h4>
            <ul className="space-y-2">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
        <CardFooter className="flex gap-4">
          <Button variant="outline" onClick={handleManagePayment}>
            Plan ändern
          </Button>
          {currentPlan !== "custom" && (
            <Button variant="destructive" onClick={handleCancel} disabled={loading}>
              Kündigen
            </Button>
          )}
        </CardFooter>
      </Card>

      {/* Plan Selection */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Pläne wechseln</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {Object.entries(STRIPE_PLANS).map(([key, planData]) => {
            const isCurrent = currentPlan === key
            const isCustom = key === "custom"

            return (
              <Card
                key={key}
                className={isCurrent ? "border-primary border-2" : ""}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{planData.name}</CardTitle>
                    {isCurrent && <Badge>Aktiv</Badge>}
                  </div>
                  <CardDescription>
                    {planData.price === 0
                      ? "Individuell"
                      : `${planData.price}€ / Monat`}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {planData.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-primary" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  {isCurrent ? (
                    <Button disabled className="w-full">
                      Aktueller Plan
                    </Button>
                  ) : isCustom ? (
                    <Button variant="outline" className="w-full">
                      Kontaktieren Sie uns
                    </Button>
                  ) : (
                    <Button
                      className="w-full"
                      onClick={() => handleUpgrade(key)}
                      disabled={loading}
                    >
                      Plan wählen
                    </Button>
                  )}
                </CardFooter>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Payment Method */}
      <Card>
        <CardHeader>
          <CardTitle>Zahlungsmethode</CardTitle>
          <CardDescription>
            Verwalten Sie Ihre Zahlungsinformationen
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-4">
              <CreditCard className="h-8 w-8 text-muted-foreground" />
              <div>
                <p className="font-medium">Visa •••• 4242</p>
                <p className="text-sm text-muted-foreground">Läuft ab 12/25</p>
              </div>
            </div>
            <Button variant="outline" onClick={handleManagePayment}>
              Ändern
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Invoice History */}
      <Card>
        <CardHeader>
          <CardTitle>Rechnungshistorie</CardTitle>
          <CardDescription>
            Alle Ihre bisherigen Rechnungen
          </CardDescription>
        </CardHeader>
        <CardContent>
          {invoices.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Noch keine Rechnungen vorhanden
            </div>
          ) : (
            <div className="space-y-4">
              {invoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <p className="font-medium">{invoice.description}</p>
                      <Badge
                        variant={
                          invoice.status === "paid" ? "success" : "warning"
                        }
                      >
                        {invoice.status === "paid" ? "Bezahlt" : "Ausstehend"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {formatDate(invoice.date)} • {invoice.id}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="font-bold">{invoice.amount}€</p>
                    <Button variant="outline" size="icon">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
