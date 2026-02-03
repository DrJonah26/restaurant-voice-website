import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import type { NextRequest } from "next/server"

// Server-side Supabase client for Route Handlers
export function createServerClient(request: NextRequest) {
  return createRouteHandlerClient({
    cookies: (() => request.cookies) as any,
  })
}
