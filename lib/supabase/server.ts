import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

// Server-side Supabase client
export async function createServerClient() {
  const cookieStore = await cookies()
  return createServerComponentClient({ cookies: () => cookieStore })
}
