"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })

      if (error) throw error

      setSent(true)
      toast.success("Wenn die E-Mail existiert, senden wir dir einen Link.")
    } catch (error: any) {
      toast.error(error.message || "Fehler beim Zurücksetzen des Passworts")
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
              <h2 className="text-4xl font-bold mb-4">Passwort vergessen?</h2>
              <p className="text-xl opacity-90">
                Wir senden dir einen sicheren Link zum Zurücksetzen.
              </p>
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="flex items-center justify-center p-8 bg-background/80">
          <Card className="w-full max-w-md border border-border shadow-sm">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold">Passwort zurücksetzen</CardTitle>
              <CardDescription>
                Gib deine E-Mail-Adresse ein, um einen Reset-Link zu erhalten
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!sent ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">E-Mail</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="name@beispiel.de"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={loading}
                      className="bg-background/50 border-border/50"
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Wird gesendet..." : "Reset-Link senden"}
                  </Button>
                </form>
              ) : (
                <div className="space-y-4 text-sm text-muted-foreground">
                  <p>Bitte prüfe dein Postfach. Der Link ist nur kurz gültig.</p>
                  <Link href="/auth/login" className="text-primary hover:underline">
                    Zurück zum Login
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
