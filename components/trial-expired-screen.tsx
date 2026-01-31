import Link from "next/link"
import { AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PricingSection } from "@/components/pricing-section"

type TrialExpiredScreenProps = {
  trialEndsAt?: Date | null
  ctaHref?: string
  title?: string
  description?: string
  ctaLabel?: string
}

export function TrialExpiredScreen({
  trialEndsAt,
  ctaHref = "/dashboard/billing",
  title = "Testzeitraum abgelaufen",
  description = "Ihr 7-Tage-Test ist beendet. Bitte wählen Sie einen Plan, um weiter Zugriff zu erhalten.",
  ctaLabel = "Plan auswählen",
}: TrialExpiredScreenProps) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(2200px_1100px_at_40%_35%,_rgba(253,224,71,0.2),_transparent_72%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(1500px_760px_at_45%_60%,_rgba(250,204,21,0.14),_transparent_75%)]" />
      </div>
      <div className="relative z-10">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                  <h1 className="text-2xl font-bold">{title}</h1>
                  <p className="text-muted-foreground mt-2">{description}</p>
                  </div>
                </div>
              <Link href={ctaHref}>
                <Button size="lg">{ctaLabel}</Button>
              </Link>
            </div>
            {trialEndsAt ? (
              <p className="text-sm text-muted-foreground mt-4">
                Testzeitraum endete am{" "}
                {trialEndsAt.toLocaleDateString("de-DE")}
              </p>
            ) : null}
          </div>
        </div>
        <PricingSection ctaHref={ctaHref} />
      </div>
    </div>
  )
}
