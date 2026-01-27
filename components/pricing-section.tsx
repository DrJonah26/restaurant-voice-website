import type { CSSProperties } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"
import { ScrollReveal } from "@/components/scroll-reveal"
import { RevealWords } from "@/components/reveal-words"

const plans = [
  {
    name: "Basic",
    price: "0€",
    period: "/ 7 Tage testen",
    description: "Ideal für kleine Restaurants und den schnellen Einstieg.",
    features: [
      "300 Anrufe/Monat",
      "Automatische Reservierungen",
      "24/7 Erreichbarkeit",
      "E-Mail Benachrichtigungen",
      "Basis Analytics",
      "Perfekt für Anrufe außerhalb der Öffnungszeiten",
    ],
    cta: "Jezzt kostenlos testen",
    subPrice: "30€ / Monat danach",
    highlighted: false,
  },
  {
    name: "Professional",
    price: "60€",
    period: "/ Monat",
    description: "Für Restaurants im Vollzeitbetrieb.",
    features: [
      "700 Anrufe/Monat",
      "Automatische Reservierungen",
      "24/7 Erreichbarkeit",
      "E-Mail & SMS Benachrichtigungen",
      "Erweiterte Analytics",
      "Priorität Support",
      "Custom Voice Agent",
      "KI übernimmt dauerhaft",
    ],
    cta: "Plan wählen",
    highlighted: true,
  },
  {
    name: "Custom",
    price: "Individuell",
    period: "",
    description: "Für große Restaurants oder individuelle Anforderungen.",
    features: [
      "Unbegrenzte Anrufe",
      "Alle Professional Features",
      "Dedicated Account Manager",
      "Custom Integration",
      "SLA Garantie",
    ],
    cta: "Kontaktieren Sie uns",
    highlighted: false,
    helper: "Sie benötigen mehr Anrufe? Kontaktieren Sie uns für ein individuelles Angebot.",
  },
]

export function PricingSection() {
  return (
    <ScrollReveal
      as="section"
      id="pricing"
      className="section-fade relative overflow-hidden py-24 bg-secondary/30"
    >
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(1900px_820px_at_48%_52%,_rgba(59,130,246,0.22),_transparent_70%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(1250px_560px_at_60%_45%,_rgba(37,99,235,0.18),_transparent_72%)]" />
      </div>
      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <span className="text-sm font-medium text-accent uppercase tracking-wider">
            <RevealWords text="Preise" startDelay={40} step={80} />
          </span>
          <h2 className="mt-4 text-3xl md:text-5xl font-bold text-foreground text-balance">
            <RevealWords text="Klare, transparente Preise" startDelay={100} step={60} />
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            <RevealWords text="Starten Sie mit einer kostenlosen Testphase – keine Kreditkarte nötig." startDelay={140} step={40} />
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={plan.name}
              className={`reveal-item relative rounded-3xl p-8 ${
                plan.highlighted
                  ? "bg-card border-2 border-accent"
                  : "bg-card border border-border"
              }`}
              style={{ "--reveal-delay": `${300 + index * 220}ms` } as CSSProperties}
            >
              {plan.highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-accent rounded-full">
                  <span className="text-sm font-medium text-accent-foreground">Empfohlen</span>
                </div>
              )}

              <div className="mb-8">
                <h3 className="text-xl font-semibold text-foreground">
                  <RevealWords text={plan.name} startDelay={120} step={45} />
                </h3>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>
                {plan.subPrice ? (
                  <p className="mt-2 text-sm text-muted-foreground">{plan.subPrice}</p>
                ) : null}
                <p className="mt-3 text-muted-foreground">
                  <RevealWords text={plan.description} startDelay={160} step={30} />
                </p>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                    <span className="text-foreground">
                      <RevealWords text={feature} startDelay={120} step={28} />
                    </span>
                  </li>
                ))}
              </ul>

              {plan.name === "Custom" ? (
                <Button
                  className="w-full bg-secondary text-foreground hover:bg-secondary/80 border border-border"
                  size="lg"
                >
                  {plan.cta}
                </Button>
              ) : (
                <Link href="/auth/signup">
                  <Button
                    className={`w-full ${
                      plan.highlighted
                        ? "bg-primary text-primary-foreground hover:bg-primary/90"
                        : "bg-secondary text-foreground hover:bg-secondary/80 border border-border"
                    }`}
                    size="lg"
                  >
                    {plan.cta}
                  </Button>
                </Link>
              )}

              {plan.helper ? (
                <p className="mt-4 text-sm text-muted-foreground">
                  <RevealWords text={plan.helper} startDelay={160} step={30} />
                </p>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </ScrollReveal>
  )
}
