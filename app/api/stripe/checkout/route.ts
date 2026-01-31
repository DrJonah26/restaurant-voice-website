import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { stripe } from "@/lib/stripe"
import { STRIPE_PLANS } from "@/lib/stripe-plans"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { plan } = await request.json()

    if (!plan || !STRIPE_PLANS[plan as keyof typeof STRIPE_PLANS]) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 })
    }

    const planData = STRIPE_PLANS[plan as keyof typeof STRIPE_PLANS]

    if (!planData.priceId) {
      return NextResponse.json(
        { error: "Plan not available for checkout" },
        { status: 400 }
      )
    }

    const { data: practice, error: practiceError } = await supabase
      .from("practices")
      .select("id, stripe_customer_id, stripe_subscription_id")
      .eq("user_id", user.id)
      .single()

    if (practiceError || !practice) {
      return NextResponse.json(
        { error: "Practice not found" },
        { status: 404 }
      )
    }

    let stripeCustomerId = practice.stripe_customer_id as string | null
    const existingSubscriptionId = practice.stripe_subscription_id as string | null

    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: user.email || undefined,
        metadata: { userId: user.id },
      })

      stripeCustomerId = customer.id

      await supabase
        .from("practices")
        .update({ stripe_customer_id: stripeCustomerId })
        .eq("id", practice.id)
    }

    if (existingSubscriptionId) {
      try {
        await stripe.subscriptions.del(existingSubscriptionId)
      } catch (cancelError) {
        console.warn("Failed to cancel existing subscription:", cancelError)
      }
    }

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: planData.priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing?canceled=true`,
      metadata: {
        userId: user.id,
        plan,
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (error: any) {
    console.error("Stripe checkout error:", error)
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}
