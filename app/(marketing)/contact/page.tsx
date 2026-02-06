import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { CONTACT_EMAIL, CONTACT_MAILTO } from "@/lib/contact"
import { ArrowRight, Mail } from "lucide-react"

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-background">
      <Header />

      <section className="relative overflow-hidden pb-24 pt-36">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(1200px_520px_at_50%_30%,_rgba(253,224,71,0.16),_transparent_72%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(900px_360px_at_55%_55%,_rgba(250,204,21,0.12),_transparent_75%)]" />
        </div>

        <div className="relative z-10 mx-auto max-w-3xl px-6">
          <div className="rounded-3xl border border-border bg-card p-8 shadow-sm md:p-10">
            <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Mail className="h-6 w-6" />
            </div>

            <h1 className="text-balance text-3xl font-bold text-foreground md:text-5xl">
              Kontaktieren Sie uns
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Senden Sie uns Ihre Fragen oder Anforderungen direkt per E-Mail. Wir melden uns schnell bei Ihnen zurueck.
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
              <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
                <a href={CONTACT_MAILTO}>
                  E-Mail senden
                  <ArrowRight className="ml-2 h-5 w-5" />
                </a>
              </Button>
              <a
                href={CONTACT_MAILTO}
                className="text-sm font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
              >
                {CONTACT_EMAIL}
              </a>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
