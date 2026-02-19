import { NextResponse } from "next/server"

export function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const completeUrl = new URL("/auth/complete", requestUrl)
  completeUrl.search = requestUrl.search
  return NextResponse.redirect(completeUrl)
}
