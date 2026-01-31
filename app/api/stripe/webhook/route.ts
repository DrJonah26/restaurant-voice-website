import { NextRequest, NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { createClient } from "@supabase/supabase-js"
import Stripe from "stripe"
import { STRIPE_PLANS } from "@/lib/stripe-plans"

export const runtime = "nodejs"

const getPlanFromPriceId = (priceId?: string | null) => {
  if (!priceId) return null
  const entry = Object.entries(STRIPE_PLANS).find(
    ([, plan]) => plan.priceId === priceId
  )
  return entry ? entry[0] : null
}

const subscriptionPlanByStripePlan = {
  basic: "starter",
  professional: "pro",
  custom: "enterprise",
} as const

const getSubscriptionPlanForStripePlan = (planKey?: string | null) => {
  if (!planKey) return null
  return (
    subscriptionPlanByStripePlan[
      planKey as keyof typeof subscriptionPlanByStripePlan
    ] || null
  )
}

const getCallsLimitForPlan = (planKey?: string | null) => {
  if (!planKey) return null
  const planData = STRIPE_PLANS[planKey as keyof typeof STRIPE_PLANS]
  if (!planData) return null
  return planData.calls > 0 ? planData.calls : null
}

const getSubscriptionStatusFromStripe = (status?: Stripe.Subscription.Status) => {
  if (!status) return "expired"
  return status === "active" || status === "trialing" ? "active" : "expired"
}

export async function POST(request: NextRequest) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json(
      { error: "Supabase environment variables missing" },
      { status: 500 }
    )
  }

  const body = await request.text()
  const signature = request.headers.get("stripe-signature")

  if (!signature) {
    return NextResponse.json(
      { error: "No signature" },
      { status: 400 }
    )
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || ""
    )
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message)
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    )
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  // Handle the event
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session
      const userId = session.metadata?.userId
      const plan = session.metadata?.plan
      const customerId =
        typeof session.customer === "string"
          ? session.customer
          : session.customer?.id || null
      const subscriptionId =
        typeof session.subscription === "string"
          ? session.subscription
          : session.subscription?.id || null

      if (userId && plan) {
        const subscriptionPlan = getSubscriptionPlanForStripePlan(plan)
        const callsLimit = getCallsLimitForPlan(plan)
        let subscriptionEndsAt: string | null = null
        let cancelAtPeriodEnd: boolean | null = null
        if (subscriptionId) {
          const subscription = await stripe.subscriptions.retrieve(subscriptionId)
          const periodEnd =
            subscription.ended_at ??
            subscription.current_period_end ??
            subscription.cancel_at ??
            subscription.canceled_at
          subscriptionEndsAt = periodEnd
            ? new Date(periodEnd * 1000).toISOString()
            : null
          cancelAtPeriodEnd = subscription.cancel_at_period_end ?? null
        }
        // Update restaurant plan in database
        await supabase
          .from("practices")
          .update({
            subscription_plan: subscriptionPlan || undefined,
            calls_limit: callsLimit,
            subscription_status: "active",
            subscription_ends_at: subscriptionEndsAt,
            subscription_cancel_at_period_end: cancelAtPeriodEnd,
            stripe_customer_id: customerId || undefined,
            stripe_subscription_id: subscriptionId || undefined,
          })
          .eq("user_id", userId)
      }
      break
    }

    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription
      const customerId =
        typeof subscription.customer === "string"
          ? subscription.customer
          : subscription.customer?.id || null

      if (customerId) {
        const priceId = subscription.items.data[0]?.price?.id
        const planKey = getPlanFromPriceId(priceId)
        const subscriptionPlan = getSubscriptionPlanForStripePlan(planKey)
        const callsLimit = getCallsLimitForPlan(planKey)
        const subscriptionStatus = getSubscriptionStatusFromStripe(subscription.status)
        const expired = subscriptionStatus !== "active"
        const periodEnd =
          subscription.ended_at ??
          subscription.current_period_end ??
          subscription.cancel_at ??
          subscription.canceled_at
        const updateData: Record<string, unknown> = {
          stripe_customer_id: customerId,
          stripe_subscription_id: subscription.id,
          subscription_status: subscriptionStatus,
          subscription_cancel_at_period_end:
            subscription.cancel_at_period_end ?? null,
        }
        if (periodEnd) {
          updateData.subscription_ends_at = new Date(periodEnd * 1000).toISOString()
        }
        await supabase
          .from("practices")
          .update({
            ...updateData,
            ...(expired
              ? { subscription_plan: "expired", calls_limit: null }
              : subscriptionPlan
                ? { subscription_plan: subscriptionPlan, calls_limit: callsLimit }
                : {}),
          })
          .eq("stripe_customer_id", customerId)
      }
      break
    }

    default:
      console.log(`Unhandled event type ${event.type}`)
  }

  return NextResponse.json({ received: true })
}
