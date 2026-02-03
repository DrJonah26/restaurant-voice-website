import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

// Server-side Supabase client for Route Handlers
export async function createServerClient() {
  const cookieStore = await cookies()
  return createRouteHandlerClient({
    cookies: () => cookieStore,
  })
}
