import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

// Server-side Supabase client
export function createServerClient() {
  return createServerComponentClient({ cookies })
}
