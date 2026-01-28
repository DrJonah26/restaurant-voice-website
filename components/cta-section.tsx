import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export function CTASection() {
  return (
    <section className="section-fade relative overflow-hidden py-24 bg-secondary/30">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(1200px_520px_at_50%_48%,_rgba(253,224,71,0.16),_transparent_70%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(820px_360px_at_45%_55%,_rgba(250,204,21,0.12),_transparent_72%)]" />
      </div>
      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        <h2 className="text-3xl md:text-5xl font-bold text-foreground text-balance">
          Bereit für weniger Stress am Telefon?
        </h2>
        <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
          Starten Sie jetzt und lassen Sie Ihre KI-Assistentin Reservierungen automatisch übernehmen.
        </p>
        
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/auth/signup">
            <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-6 text-base">
              Kostenlos testen
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>

        <p className="mt-6 text-sm text-muted-foreground">
          Keine Kreditkarte nötig · 7 Tage kostenlos · Jederzeit kündbar
        </p>
      </div>
    </section>
  )
}
