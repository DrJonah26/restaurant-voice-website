import { NextResponse } from "next/server"

export function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const callbackUrl = new URL("/auth/callback", requestUrl)
  callbackUrl.search = requestUrl.search
  return NextResponse.redirect(callbackUrl)
}
