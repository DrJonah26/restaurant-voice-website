"use client"

import type { CSSProperties } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ScrollReveal } from "@/components/scroll-reveal"
import { RevealWords } from "@/components/reveal-words"
import { ArrowRight, Play } from "lucide-react"

export function HeroSection() {
  return (
    <ScrollReveal
      as="section"
      className="section-fade section-fade-sm relative min-h-[80vh] flex items-center justify-center pt-16 pb-8 overflow-hidden"
    >
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(2400px_920px_at_50%_50%,_rgba(59,130,246,0.28),_transparent_70%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(1720px_680px_at_50%_52%,_rgba(37,99,235,0.22),_transparent_72%)]" />
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(59,130,246,0.07) 1px, transparent 1px), linear-gradient(to bottom, rgba(59,130,246,0.07) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        />
        <div className="absolute top-[34%] left-[4%] w-[64rem] h-[52rem] bg-accent/10 rounded-full blur-3xl" />
        <div className="absolute bottom-[28%] right-[8%] w-[56rem] h-[46rem] bg-accent/14 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-20 text-center">
        <div className="reveal-item inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary border border-border mb-8">
          <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
          <span className="text-sm text-muted-foreground">KI für Restaurant-Telefonie</span>
        </div>

        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground leading-tight tracking-tight max-w-5xl mx-auto text-balance">
          <RevealWords text="Nie wieder verpasste Anrufe" startDelay={80} step={70} />
        </h1>

        <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed text-pretty">
          <RevealWords text="KI beantwortet Telefonate, bucht Tische und entlastet Ihr Team — rund um die Uhr." startDelay={140} step={40} />
        </p>

        <div
          className="reveal-item mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
          style={{ "--reveal-delay": "340ms" } as CSSProperties}
        >
          <Link href="/auth/signup">
            <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-6 text-base">
              Kostenlos testen
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
          <Link href="#demo">
            <Button variant="outline" size="lg" className="px-8 py-6 text-base border-border text-foreground hover:bg-secondary bg-transparent">
              <Play className="mr-2 w-5 h-5" />
              Demo anhören
            </Button>
          </Link>
        </div>
      </div>
    </ScrollReveal>
  )
}
