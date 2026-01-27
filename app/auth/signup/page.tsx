"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

export default function SignupPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const getPasswordStrength = (password: string) => {
    if (password.length === 0) return { strength: 0, label: "" }
    if (password.length < 6) return { strength: 1, label: "Schwach" }
    if (password.length < 10) return { strength: 2, label: "Mittel" }
    if (/[A-Z]/.test(password) && /[a-z]/.test(password) && /[0-9]/.test(password)) {
      return { strength: 4, label: "Sehr stark" }
    }
    return { strength: 3, label: "Stark" }
  }

  const passwordStrength = getPasswordStrength(password)

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()

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
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) throw error

      toast.success("Registrierung erfolgreich! Bitte bestätigen Sie Ihre E-Mail.")
      //router.push("/onboarding")
    } catch (error: any) {
      toast.error(error.message || "Fehler bei der Registrierung")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen grid md:grid-cols-2 bg-background">
      {/* Left Side - Image */}
      <div className="hidden md:block relative bg-secondary/30 border-r border-border">
        <div className="relative h-full flex items-center justify-center p-12 text-foreground">
          <div className="bg-card border border-border p-8 rounded-2xl shadow-sm">
            <h2 className="text-4xl font-bold mb-4">
              Starten Sie noch heute!
            </h2>
            <p className="text-xl opacity-90">
              Erstellen Sie Ihr Konto und transformieren Sie Ihr Restaurant.
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex items-center justify-center p-8">
        <Card className="w-full max-w-md border border-border shadow-sm">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">Registrieren</CardTitle>
            <CardDescription>
              Erstellen Sie ein Konto, um loszulegen
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignup} className="space-y-4">
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
              <div className="space-y-2">
                <Label htmlFor="password">Passwort</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  className="bg-background/50 border-border/50"
                />
                {password && (
                  <div className="space-y-1">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4].map((level) => (
                        <div
                          key={level}
                          className={`h-1 flex-1 rounded transition-all ${
                            level <= passwordStrength.strength
                              ? level <= 2
                                ? "bg-red-500"
                                : level === 3
                                ? "bg-yellow-500"
                                : "bg-green-500"
                              : "bg-muted"
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Passwort-Stärke: {passwordStrength.label}
                    </p>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Passwort bestätigen</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={loading}
                  className="bg-background/50 border-border/50"
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Wird registriert..." : "Registrieren"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="text-sm text-center text-muted-foreground">
              Bereits ein Konto?{" "}
              <Link href="/auth/login" className="text-primary hover:underline">
                Anmelden
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
