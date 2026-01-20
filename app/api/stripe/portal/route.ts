import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { stripe } from "@/lib/stripe"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: practice, error: practiceError } = await supabase
      .from("practices")
      .select("stripe_customer_id")
      .eq("user_id", user.id)
      .single()

    if (practiceError || !practice?.stripe_customer_id) {
      return NextResponse.json(
        { error: "Stripe customer not found" },
        { status: 400 }
      )
    }

    // Create portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: practice.stripe_customer_id,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing`,
    })

    return NextResponse.json({ url: session.url })
  } catch (error: any) {
    console.error("Stripe portal error:", error)
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}
