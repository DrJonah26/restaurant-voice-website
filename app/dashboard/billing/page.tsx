"use client"


import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Check, CreditCard, AlertCircle } from "lucide-react"
import { STRIPE_PLANS, TRIAL_CALLS_LIMIT } from "@/lib/stripe-plans"
import { toast } from "sonner"

type BillingPlanKey = keyof typeof STRIPE_PLANS | "trial"

const stripePlanBySubscriptionPlan = {
  starter: "basic",
  pro: "professional",
  enterprise: "custom",
} as const

const FREE_TRIAL_PLAN = {
  name: "Free",
  price: 0,
  calls: TRIAL_CALLS_LIMIT,
  features: [
    `${TRIAL_CALLS_LIMIT} Anrufe/Monat`,
    ...STRIPE_PLANS.basic.features.slice(1),
  ],
} as const

const getStripePlanKey = (subscriptionPlan?: string | null): BillingPlanKey => {
  if (!subscriptionPlan) return "basic"
  if (subscriptionPlan === "trial" || subscriptionPlan === "expired") {
    return "trial"
  }
  return (
    stripePlanBySubscriptionPlan[
      subscriptionPlan as keyof typeof stripePlanBySubscriptionPlan
    ] || "basic"
  )
}

export default function BillingPage() {
  const router = useRouter()
  const [restaurant, setRestaurant] = useState<any>(null)
  const [currentPlan, setCurrentPlan] = useState<BillingPlanKey>("basic")
  const [usage, setUsage] = useState({ calls: 234, limit: 300 })
  const [loading, setLoading] = useState(false)
  const [trialExpired, setTrialExpired] = useState(false)
  const [trialEndDate, setTrialEndDate] = useState<Date | null>(null)
  const [subscriptionEndsAt, setSubscriptionEndsAt] = useState<Date | null>(null)
  const [subscriptionCancelAtPeriodEnd, setSubscriptionCancelAtPeriodEnd] =
    useState(false)
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

      const practiceId = restaurantData.practice_id ?? restaurantData.id
      const now = new Date()
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
      const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)

      const callsMonthResult = await supabase
        .from("call_logs")
        .select("id", { count: "exact", head: true })
        .eq("practice_id", practiceId)
        .gte("started_at", monthStart.toISOString())
        .lte("started_at", monthEnd.toISOString())

      setRestaurant(restaurantData)
      const paidPlans = ["starter", "pro", "enterprise"]
      const isPaidPlan = paidPlans.includes(restaurantData.subscription_plan)
      const trialEnd = restaurantData.trial_ends_at
        ? new Date(restaurantData.trial_ends_at)
        : null
      const renewalDate = restaurantData.subscription_ends_at
        ? new Date(restaurantData.subscription_ends_at)
        : null
      const cancelAtPeriodEnd = !!restaurantData.subscription_cancel_at_period_end
      const expired =
        !!trialEnd && new Date() > trialEnd && !isPaidPlan
      setTrialExpired(expired)
      setTrialEndDate(trialEnd)
      setSubscriptionEndsAt(renewalDate)
      setSubscriptionCancelAtPeriodEnd(cancelAtPeriodEnd)
      const planKey = getStripePlanKey(restaurantData.subscription_plan)
      const resolvedPlan =
        planKey === "trial"
          ? FREE_TRIAL_PLAN
          : STRIPE_PLANS[planKey as keyof typeof STRIPE_PLANS]
      setCurrentPlan(planKey)
      setUsage({
        calls: callsMonthResult.count ?? 0,
        limit:
          restaurantData.calls_limit ??
          resolvedPlan.calls,
      })
    }

    loadData()
  }, [router, supabase])

  const plan =
    currentPlan === "trial"
      ? FREE_TRIAL_PLAN
      : STRIPE_PLANS[currentPlan as keyof typeof STRIPE_PLANS]
  const usagePercentage =
    usage.limit > 0 ? (usage.calls / usage.limit) * 100 : 0
  const trialDaysLeft =
    currentPlan === "trial" && trialEndDate
      ? Math.max(
          0,
          Math.ceil(
            (trialEndDate.getTime() - Date.now()) / (24 * 60 * 60 * 1000)
          )
        )
      : null
  const cancelDateLabel = subscriptionEndsAt
    ? subscriptionEndsAt.toLocaleDateString("de-DE")
    : null
  const showStatusBadge = !subscriptionCancelAtPeriodEnd
  const statusBadgeVariant = trialExpired
    ? "destructive"
    : subscriptionCancelAtPeriodEnd
      ? "secondary"
      : currentPlan === "professional"
        ? "default"
        : "secondary"
  const statusBadgeLabel = trialExpired
    ? "Abgelaufen"
    : subscriptionCancelAtPeriodEnd
      ? cancelDateLabel
        ? `Läuft aus ${cancelDateLabel}`
        : "Läuft aus"
      : currentPlan === "professional"
        ? "Empfohlen"
        : "Aktiv"

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
      const response = await fetch("/api/stripe/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data?.error || "Fehler beim Öffnen des Portals")
      }

      if (data?.url) {
        window.location.href = data.url
        return
      }

      throw new Error("Stripe Portal URL fehlt")
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

      {trialExpired && (
        <Card className="border-destructive/40 bg-destructive/5">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <CardTitle>Testzeitraum abgelaufen</CardTitle>
            </div>
            <CardDescription>
              Bitte wählen Sie einen Plan, um wieder Zugriff zu erhalten.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="text-sm text-muted-foreground">
              {trialEndDate
                ? `Test endete am ${trialEndDate.toLocaleDateString("de-DE")}.`
                : null}
            </div>
            <Button
              onClick={() =>
                document
                  .getElementById("plan-selection")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
            >
              Plan auswählen
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Current Plan */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Aktueller Plan</CardTitle>
              <CardDescription>
                {plan.name} Plan - {plan.price === 0 ? "Kostenlos" : `${plan.price}€/Monat`}
                {trialDaysLeft !== null && !trialExpired
                  ? ` · läuft noch ${trialDaysLeft} ${
                      trialDaysLeft === 1 ? "Tag" : "Tage"
                    }`
                  : ""}
                {trialDaysLeft === null && subscriptionEndsAt
                  ? subscriptionCancelAtPeriodEnd
                    ? ` · läuft aus am ${subscriptionEndsAt.toLocaleDateString("de-DE")}`
                    : ` · wird erneut am ${subscriptionEndsAt.toLocaleDateString("de-DE")}`
                  : ""}
              </CardDescription>
            </div>
            {showStatusBadge ? (
              <Badge variant={statusBadgeVariant}>{statusBadgeLabel}</Badge>
            ) : null}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium">Anrufe diesen Monat</span>
              <span className="text-sm text-muted-foreground">
                {usage.calls}
                {usage.limit ? ` / ${usage.limit}` : ""}
              </span>
            </div>
            <div className="text-xs text-muted-foreground mb-2">
              {usage.limit ? "Monatslimit" : "Kein Limit gesetzt"}
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
            {currentPlan === "custom" ? (
              <p className="text-sm text-muted-foreground">
                {STRIPE_PLANS.custom.helper}
              </p>
            ) : (
              <ul className="space-y-2">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex gap-4">
          {!subscriptionCancelAtPeriodEnd && (
            <>
              <Button variant="outline" onClick={handleManagePayment}>
                Plan ändern
              </Button>
              {currentPlan !== "custom" && (
                <Button
                  variant="destructive"
                  onClick={handleCancel}
                  disabled={loading}
                >
                  Kündigen
                </Button>
              )}
            </>
          )}
        </CardFooter>
      </Card>

      {/* Plan Selection */}
      <div id="plan-selection">
        <h2 className="text-2xl font-bold mb-6">Pläne wechseln</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {Object.entries(STRIPE_PLANS).map(([key, planData]) => {
            const isCurrent = currentPlan === key && !subscriptionCancelAtPeriodEnd
            const isCustom = key === "custom"
            const customHelper = isCustom ? STRIPE_PLANS.custom.helper : null

            return (
              <Card
                key={key}
                className={`flex h-full flex-col ${isCurrent ? "border-primary border-2" : ""}`}
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
                <CardContent className="flex-1">
                  {isCustom ? (
                    <p className="text-sm text-muted-foreground">
                      {customHelper}
                    </p>
                  ) : (
                    <ul className="space-y-2">
                      {planData.features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-2 text-sm">
                          <Check className="h-4 w-4 text-primary" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
                <CardFooter className="mt-auto">
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

    </div>
  )
}
