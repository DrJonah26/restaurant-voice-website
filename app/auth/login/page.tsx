"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Eye, EyeOff } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      toast.success("Erfolgreich angemeldet!")
      router.push("/dashboard")
    } catch (error: any) {
      toast.error(error.message || "Fehler beim Anmelden")
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
              Willkommen zurück!
            </h2>
            <p className="text-xl opacity-90">
              Melden Sie sich an, um Ihr Restaurant zu verwalten.
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex items-center justify-center p-8 bg-background/80">
        <Card className="w-full max-w-md border border-border shadow-sm">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">Anmelden</CardTitle>
            <CardDescription>
              Geben Sie Ihre E-Mail-Adresse ein, um sich anzumelden
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
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
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Passwort</Label>
                  <Link
                    href="/auth/forgot-password"
                    className="text-sm text-primary hover:underline"
                  >
                    Passwort vergessen?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                    className="bg-background/50 border-border/50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Wird angemeldet..." : "Anmelden"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="text-sm text-center text-muted-foreground">
              Noch kein Konto?{" "}
              <Link href="/auth/signup" className="text-primary hover:underline">
                Registrieren
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
      </div>
    </div>
  )
}
