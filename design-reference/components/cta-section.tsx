import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export function CTASection() {
  return (
    <section className="py-24 bg-secondary/30">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <h2 className="text-3xl md:text-5xl font-bold text-foreground text-balance">
          Ready to Transform Your Restaurant?
        </h2>
        <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
          Join 500+ restaurants already using Reseva to automate reservations 
          and deliver exceptional guest experiences.
        </p>
        
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-6 text-base">
            Start Your Free Trial
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
          <Button variant="outline" size="lg" className="px-8 py-6 text-base border-border text-foreground hover:bg-secondary bg-transparent">
            Schedule a Demo
          </Button>
        </div>

        <p className="mt-6 text-sm text-muted-foreground">
          No credit card required · 14-day free trial · Cancel anytime
        </p>
      </div>
    </section>
  )
}
