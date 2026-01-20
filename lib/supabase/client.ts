import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

// Client-side Supabase client
export function createClient() {
    return createClientComponentClient()
}
