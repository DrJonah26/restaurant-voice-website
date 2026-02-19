import { createServerClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const nextPath = requestUrl.searchParams.get("next")
  const redirectPath = nextPath && nextPath.startsWith("/") ? nextPath : "/dashboard"

  if (!code) {
    return NextResponse.redirect(new URL("/auth/login", request.url))
  }

  const supabase = createServerClient()
  const { error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    return NextResponse.redirect(new URL("/auth/login", request.url))
  }

  return NextResponse.redirect(new URL(redirectPath, request.url))
}
