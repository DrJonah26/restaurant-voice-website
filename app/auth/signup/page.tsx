"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import { evaluatePasswordStrength } from "@/lib/password-strength"
import { toast } from "sonner"

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? window.location.origin

export default function SignupPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  const passwordStrength = evaluatePasswordStrength(password, { email })

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    const normalizedEmail = email.trim().toLowerCase()

    if (password !== confirmPassword) {
      toast.error("Passwörter stimmen nicht überein")
      return
    }

    const passwordCheck = evaluatePasswordStrength(password, { email: normalizedEmail })
    if (!passwordCheck.isStrong) {
      toast.error(passwordCheck.feedback[0] ?? "Bitte ein starkes Passwort verwenden")
      return
    }

    setLoading(true)

    try {
      const { data, error } = await supabase.auth.signUp({
        email: normalizedEmail,
        password,
        options: {
          emailRedirectTo: `${siteUrl}/auth/callback`,
        },
      })

      if (error) {
        const errorMessage = error.message?.toLowerCase() ?? ""
        const isAlreadyRegisteredError =
          errorMessage.includes("user already registered") || errorMessage.includes("already exists")

        if (isAlreadyRegisteredError) {
          toast.error(`Auf dieser E-Mail (${normalizedEmail}) besteht bereits ein Konto.`)
          return
        }

        throw error
      }

      const isAlreadyRegisteredByObfuscation =
        data.user?.identities !== undefined && data.user.identities.length === 0

      if (isAlreadyRegisteredByObfuscation) {
        toast.error(`Auf dieser E-Mail (${normalizedEmail}) besteht bereits ein Konto.`)
        return
      }

      toast.success("Registrierung erfolgreich! Bitte bestätigen Sie Ihre E-Mail.")
      //router.push("/onboarding")
    } catch (error: any) {
      toast.error(error.message || "Fehler bei der Registrierung")
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
      <div className="flex items-center justify-center p-8 bg-background/80">
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
                    {!passwordStrength.isStrong && passwordStrength.feedback.length > 0 && (
                      <p className="text-xs text-muted-foreground">
                        {passwordStrength.feedback[0]}
                      </p>
                    )}
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
              <Button
                type="submit"
                className="w-full"
                disabled={loading || !passwordStrength.isStrong}
              >
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
    </div>
  )
}
