import { Phone, Calendar, Clock, MessageSquare, BarChart3, Globe } from "lucide-react"

const features = [
  {
    icon: Phone,
    title: "Natürliche Gespräche",
    description: "Die KI spricht natürlich und verarbeitet komplexe Anfragen – wie Ihr bester Mitarbeiter.",
  },
  {
    icon: Calendar,
    title: "Smarter Kalender",
    description: "Intelligente Reservierungsverwaltung, die Auslastung optimiert und Doppelbuchungen verhindert.",
  },
  {
    icon: Clock,
    title: "24/7 Erreichbarkeit",
    description: "Kein Anruf geht verloren – auch außerhalb der Öffnungszeiten oder in Stoßzeiten.",
  },
  {
    icon: MessageSquare,
    title: "Mehrsprachig",
    description: "Kommunizieren Sie mit Gästen in ihrer bevorzugten Sprache – ohne Mehraufwand.",
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    description: "Echtzeit-Insights zu Anrufen, Buchungen und Präferenzen – für bessere Entscheidungen.",
  },
  {
    icon: Globe,
    title: "System-Integration",
    description: "Nahtlose Anbindung an bestehende Reservierungs- oder Kassensysteme.",
  },
]

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 bg-secondary/30">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <span className="text-sm font-medium text-accent uppercase tracking-wider">Features</span>
          <h2 className="mt-4 text-3xl md:text-5xl font-bold text-foreground text-balance">
            Alles, was Ihr Restaurant braucht
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Leistungsstarke Funktionen, speziell für die Gastronomie entwickelt.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group p-8 rounded-2xl bg-card border border-border hover:border-accent/50 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center mb-6 group-hover:bg-accent/20 transition-colors">
                <feature.icon className="w-6 h-6 text-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
