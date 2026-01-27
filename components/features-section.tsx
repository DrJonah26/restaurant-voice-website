import type { CSSProperties } from "react"
import { Phone, Calendar, Clock, BarChart3 } from "lucide-react"
import { ScrollReveal } from "@/components/scroll-reveal"
import { RevealWords } from "@/components/reveal-words"

const features = [
  {
    icon: Phone,
    title: "Natürliche Gespräche",
    description: "Die KI spricht natürlich und verarbeitet komplexe Anfragen; wie Ihr bester Mitarbeiter.",
  },
  {
    icon: Calendar,
    title: "Smarter Kalender",
    description: "Intelligente Reservierungsverwaltung, die Auslastung optimiert und Doppelbuchungen verhindert.",
  },
  {
    icon: Clock,
    title: "24/7 Erreichbarkeit",
    description: "Kein Anruf geht verloren; auch außerhalb der Öffnungszeiten oder in Stoßzeiten.",
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    description: "Echtzeit-Insights zu Anrufen, Buchungen und Präferenzen; für bessere Entscheidungen.",
  },
]

export function FeaturesSection() {
  return (
    <ScrollReveal
      as="section"
      id="features"
      className="section-fade relative overflow-hidden py-24 bg-secondary/30"
    >
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(1800px_780px_at_45%_55%,_rgba(59,130,246,0.22),_transparent_70%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(1200px_520px_at_60%_45%,_rgba(37,99,235,0.18),_transparent_72%)]" />
      </div>
      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <span className="text-sm font-medium text-accent uppercase tracking-wider">
            <RevealWords text="Features" startDelay={40} step={80} />
          </span>
          <h2 className="mt-4 text-3xl md:text-5xl font-bold text-foreground text-balance">
            <RevealWords text="Alles, was Ihr Restaurant braucht" startDelay={100} step={60} />
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            <RevealWords text="Leistungsstarke Funktionen, speziell für die Gastronomie entwickelt." startDelay={140} step={40} />
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-6">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="reveal-item group p-8 rounded-2xl bg-card border border-border hover:border-accent/50 transition-all duration-300"
              style={{ "--reveal-delay": `${260 + index * 200}ms` } as CSSProperties}
            >
              <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center mb-6 group-hover:bg-accent/20 transition-colors">
                <feature.icon className="w-6 h-6 text-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">
                <RevealWords text={feature.title} startDelay={120} step={45} />
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                <RevealWords text={feature.description} startDelay={160} step={30} />
              </p>
            </div>
          ))}
        </div>
      </div>
    </ScrollReveal>
  )
}
