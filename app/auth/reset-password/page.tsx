"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)
  const [hasSession, setHasSession] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    let mounted = true
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return
      setHasSession(!!session)
      setChecking(false)
    })

    supabase.auth.getSession().then(({ data: sessionData }) => {
      if (!mounted) return
      setHasSession(!!sessionData.session)
      setChecking(false)
    })

    return () => {
      mounted = false
      data.subscription?.unsubscribe()
    }
  }, [supabase])

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!hasSession) {
      toast.error("Der Reset-Link ist ungültig oder abgelaufen")
      return
    }

    if (password !== confirmPassword) {
      toast.error("Passwörter stimmen nicht überein")
      return
    }

    if (password.length < 6) {
      toast.error("Passwort muss mindestens 6 Zeichen lang sein")
      return
    }

    setLoading(true)

    try {
      const { error } = await supabase.auth.updateUser({ password })
      if (error) throw error

      toast.success("Passwort aktualisiert. Bitte melde dich erneut an.")
      await supabase.auth.signOut()
      router.push("/auth/login")
    } catch (error: any) {
      toast.error(error.message || "Fehler beim Aktualisieren des Passworts")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(1600px_820px_at_50%_40%,_rgba(253,224,71,0.25),_transparent_70%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(1000px_520px_at_60%_60%,_rgba(250,204,21,0.18),_transparent_72%)]" />
      </div>
      <div className="relative z-10 min-h-screen grid md:grid-cols-2">
        {/* Left Side - Info */}
        <div className="hidden md:block relative bg-secondary/30 border-r border-border">
          <div className="relative h-full flex items-center justify-center p-12 text-foreground">
            <div className="bg-card border border-border p-8 rounded-2xl shadow-sm">
              <h2 className="text-4xl font-bold mb-4">Neues Passwort setzen</h2>
              <p className="text-xl opacity-90">
                Waehle ein sicheres Passwort für dein Konto.
              </p>
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="flex items-center justify-center p-8 bg-background/80">
          <Card className="w-full max-w-md border border-border shadow-sm">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold">Passwort aktualisieren</CardTitle>
              <CardDescription>
                {checking
                  ? "Link wird geprüft..."
                  : hasSession
                  ? "Gib dein neues Passwort ein"
                  : "Der Link ist ungültig oder abgelaufen"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {hasSession ? (
                <form onSubmit={handleReset} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="password">Neues Passwort</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="********"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={loading || checking}
                      className="bg-background/50 border-border/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Passwort bestaetigen</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="********"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      disabled={loading || checking}
                      className="bg-background/50 border-border/50"
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading || checking}>
                    {loading ? "Wird gespeichert..." : "Passwort speichern"}
                  </Button>
                </form>
              ) : (
                <div className="space-y-4 text-sm text-muted-foreground">
                  <p>Bitte fordere einen neuen Reset-Link an.</p>
                  <Link href="/auth/forgot-password" className="text-primary hover:underline">
                    Neuen Link anfordern
                  </Link>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <div className="text-sm text-center text-muted-foreground">
                Zurück zum{" "}
                <Link href="/auth/login" className="text-primary hover:underline">
                  Anmelden
                </Link>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
