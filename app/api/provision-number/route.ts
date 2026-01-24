import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import twilio from "twilio"

export const runtime = "nodejs"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? ""
)

const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
)

const VOICE_AGENT_URL = process.env.VOICE_AGENT_URL

export async function POST(request: NextRequest) {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json(
        { error: "Supabase environment variables missing" },
        { status: 500 }
      )
    }

    if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
      return NextResponse.json(
        { error: "Twilio credentials missing" },
        { status: 500 }
      )
    }

    if (!VOICE_AGENT_URL) {
      return NextResponse.json(
        { error: "VOICE_AGENT_URL is not configured" },
        { status: 500 }
      )
    }

    const { practiceId } = await request.json()

    if (!practiceId) {
      return NextResponse.json(
        { error: "Practice ID required" },
        { status: 400 }
      )
    }

    const { data: practice, error: practiceError } = await supabase
      .from("practices")
      .select("id, name, twilio_number")
      .eq("id", practiceId)
      .single()

    if (practiceError || !practice) {
      return NextResponse.json(
        { error: "Practice not found" },
        { status: 404 }
      )
    }

    if (practice.twilio_number) {
      return NextResponse.json({
        success: true,
        phoneNumber: practice.twilio_number,
        message: "Number already exists",
      })
    }

    const availableNumbers = await twilioClient
      .availablePhoneNumbers("GB")
      .local
      .list({
        voiceEnabled: true,
        limit: 5,
      })

    if (availableNumbers.length === 0) {
      throw new Error("No available UK phone numbers")
    }

    const selectedNumber = availableNumbers[0].phoneNumber

    const purchasedNumber = await twilioClient.incomingPhoneNumbers.create({
      phoneNumber: selectedNumber,
      voiceUrl: `${VOICE_AGENT_URL}/incoming-call?practice_id=${practiceId}`,
      voiceMethod: "POST",
      friendlyName: `${practice.name} - Voice AI`,
    })

    const { error: updateError } = await supabase
      .from("practices")
      .update({
        twilio_number: selectedNumber,
        updated_at: new Date().toISOString(),
      })
      .eq("id", practiceId)

    if (updateError) {
      return NextResponse.json(
        { error: "Failed to update practice with Twilio number" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      phoneNumber: selectedNumber,
      twilioSid: purchasedNumber.sid,
      message: "Phone number provisioned successfully",
    })
  } catch (error: any) {
    if (error?.code === 21422) {
      return NextResponse.json(
        { error: "This phone number is not available" },
        { status: 400 }
      )
    }

    if (error?.code === 20003) {
      return NextResponse.json(
        { error: "Authentication failed. Check Twilio credentials." },
        { status: 401 }
      )
    }

    return NextResponse.json(
      {
        error: "Failed to provision phone number",
        details: error?.message ?? "Unknown error",
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json(
      { error: "Supabase environment variables missing" },
      { status: 500 }
    )
  }

  const practiceId = request.nextUrl.searchParams.get("practice_id")

  if (!practiceId) {
    return NextResponse.json(
      { error: "Practice ID required" },
      { status: 400 }
    )
  }

  const { data: practice, error } = await supabase
    .from("practices")
    .select("twilio_number")
    .eq("id", practiceId)
    .single()

  if (error) {
    return NextResponse.json(
      { error: "Failed to load practice" },
      { status: 500 }
    )
  }

  return NextResponse.json({
    hasNumber: !!practice?.twilio_number,
    phoneNumber: practice?.twilio_number ?? null,
  })
}
