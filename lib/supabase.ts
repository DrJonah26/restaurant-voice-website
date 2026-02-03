import { createClientComponentClient, createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

// Client-side Supabase client
export function createClient() {
  return createClientComponentClient()
}

// Server-side Supabase client
export async function createServerClient() {
  const cookieStore = await cookies()
  return createServerComponentClient({ cookies: () => cookieStore })
}
