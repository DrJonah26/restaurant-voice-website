import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import type { NextRequest } from "next/server"

// Server-side Supabase client for Route Handlers
export function createServerClient(_request?: NextRequest) {
  return createRouteHandlerClient({ cookies })
}
