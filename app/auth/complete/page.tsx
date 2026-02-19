"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

const resolveNextPath = (value: string | null) => {
  if (value && value.startsWith("/")) return value
  return "/dashboard"
}

export default function AuthCompletePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  const code = searchParams.get("code")
  const nextPath = resolveNextPath(searchParams.get("next"))
  const authError = searchParams.get("error")
  const authErrorDescription = searchParams.get("error_description")

  useEffect(() => {
    const finishOAuth = async () => {
      if (authError || authErrorDescription) {
        router.replace("/auth/login")
        return
      }

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (error) {
          router.replace("/auth/login")
          return
        }
      } else {
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (!session) {
          router.replace("/auth/login")
          return
        }
      }

      router.replace(nextPath)
    }

    finishOAuth()
  }, [authError, authErrorDescription, code, nextPath, router, supabase])

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <div className="text-center text-sm text-muted-foreground">
        Anmeldung wird abgeschlossen...
      </div>
    </div>
  )
}
