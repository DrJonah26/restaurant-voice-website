"use client"

import type { CSSProperties } from "react"
import { useState, useRef, useEffect } from "react"
import { Play, Pause, Volume2, Mic, Phone, Settings, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollReveal } from "@/components/scroll-reveal"
import { RevealWords } from "@/components/reveal-words"

const steps = [
  {
    number: "01",
    title: "Nummer verbinden",
    description: "Leiten Sie Ihre bestehende Telefonnummer um oder erhalten Sie in Minuten eine neue Nummer.",
    icon: Phone,
  },
  {
    number: "02",
    title: "KI konfigurieren",
    description: "Öffnungszeiten, Speisekarte, Sonderwünsche und Gesprächsstil individuell festlegen.",
    icon: Settings,
  },
  {
    number: "03",
    title: "Live gehen",
    description: "Die KI übernimmt sofort. Transkripte und Buchungen sehen Sie in Echtzeit.",
    icon: Zap,
  },
]

const chatMessages = [
  { type: "ai", text: "Restaurant Lindenhof, guten Tag. Wie kann ich Ihnen behilflich sein?" },
  { type: "user", text: "Guten Tag, ich würde gerne einen Tisch bei Ihnen reservieren." },
  { type: "ai", text: "Sehr gerne! Für welches Datum und um welche Uhrzeit soll die Reservierung sein?" },
  { type: "user", text: "Bitte für übermorgen um 16:00 Uhr." },
  { type: "ai", text: "Wir haben von 1700-22:00 Uhr geöffnet. Welche Zeit würde ihnen passen übermorgen nach 17:00 Uhr?" },
  { type: "user", text: "Ahhh, achso. Ja dann doch um 18:00 Uhr." },
  { type: "ai", text: "Alles klar, übermorgen um 18:00 Uhr. Für wieviele Personen soll der Tisch sein?" },
  { type: "user", text: "Für 2 Leute." },
  { type: "ai", text: "Einen Moment, ich überprüfe jetzt, ob wir noch einen Tisch frei haben..." },
  { type: "ai", text: "Super, da haben wir noch einen Tisch frei. Auf welchen Namen darf ich reservien?" },
  { type: "user", text: "Ahh, nein sorry, mir fällt gerade ein, ich kann übermoregn gar nicht. Bitte doch erst am Freitag." },
  { type: "ai", text: "Alles klar, also am Freitag. Um welche Uhrzeit möchten sie da kommen?" },
  { type: "user", text: "Achso, ja dann wieder um 18:00 Uhr am besten." },
  { type: "ai", text: "Also am Freitag, um 18:00 Uhr für 2 Personen, richtig?" },
  { type: "user", text: "Genau." },
  { type: "ai", text: "Super, da haben wir noch einen Tisch frei. Auf welchen Namen darf ich reservien?" },
  { type: "user", text: "Jonah Alt." },
  { type: "ai", text: "Also, Freitag um 18 Uhr für 2 Personen auf Jonah Alt. Ist das so korrekt?" },
  { type: "user", text: "Genau, das stimmt." },
  { type: "ai", text: "Perfekt, die Reservierung ist eingetragen. Vielen Dank, und bis Freitag!" },
  { type: "user", text: "Bis Freitag." },
]

export function HowItWorksSection() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(75)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const togglePlay = () => {
    const audio = audioRef.current
    if (!audio) return

    if (audio.paused) {
      void audio.play()
    } else {
      audio.pause()
    }
  }

  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60)
    const secs = Math.floor(time % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <>
      {/* Steps Section */}
      <ScrollReveal
        as="section"
        id="how-it-works"
        className="section-fade relative overflow-hidden py-20 bg-background"
      >
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(1600px_700px_at_55%_52%,_rgba(59,130,246,0.2),_transparent_70%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(1100px_480px_at_40%_48%,_rgba(37,99,235,0.16),_transparent_72%)]" />
        </div>
        <div className="relative z-10 max-w-5xl mx-auto px-6">
          <div className="text-center mb-14">
            <span className="text-sm font-medium text-accent uppercase tracking-wider">
              <RevealWords text="So funktioniert's" startDelay={40} step={70} />
            </span>
            <h2 className="mt-3 text-3xl md:text-4xl font-bold text-foreground text-balance">
              <RevealWords text="In wenigen Minuten startklar" startDelay={110} step={60} />
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <div key={step.number} className="relative">
                <div
                  className="reveal-item bg-card border border-border rounded-2xl p-6 h-full hover:shadow-lg hover:border-accent/30 transition-all"
                  style={{ "--reveal-delay": `${260 + index * 200}ms` } as CSSProperties}
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                      <step.icon className="w-6 h-6 text-accent" />
                    </div>
                    <span className="text-3xl font-bold text-muted-foreground/30">{step.number}</span>
                  </div>
                  <h3 className="font-semibold text-foreground text-lg mb-2">
                    <RevealWords text={step.title} startDelay={120} step={45} />
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    <RevealWords text={step.description} startDelay={160} step={30} />
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </ScrollReveal>

      {/* Demo Section */}
      <ScrollReveal
        as="section"
        id="demo"
        className="section-fade relative overflow-hidden py-20 bg-secondary/30"
      >
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(1700px_740px_at_50%_55%,_rgba(59,130,246,0.21),_transparent_70%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(1150px_520px_at_62%_45%,_rgba(37,99,235,0.17),_transparent_72%)]" />
        </div>
        <div className="relative z-10 max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <span className="text-sm font-medium text-accent uppercase tracking-wider">
              <RevealWords text="Live Demo" startDelay={40} step={70} />
            </span>
            <h2 className="mt-3 text-3xl md:text-4xl font-bold text-foreground text-balance">
              <RevealWords text="Hören Sie selbst" startDelay={120} step={60} />
            </h2>
            <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
              <RevealWords text="Ein Gespräch zwischen Gast und KI-Assistent." startDelay={160} step={40} />
            </p>
          </div>

          <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-lg">
            <div className="grid md:grid-cols-2">
              {/* Audio Player */}
              <div
                className="reveal-item p-6 md:p-8 border-b md:border-b-0 md:border-r border-border"
                style={{ "--reveal-delay": "260ms" } as CSSProperties}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center">
                    <Mic className="w-6 h-6 text-accent-foreground" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">Demo-Anruf</h4>
                    <p className="text-sm text-muted-foreground">Hören Sie eine echte KI-Konversation</p>
                  </div>
                </div>

                <div className="bg-secondary rounded-xl p-5">
                  <audio
                    ref={audioRef}
                    src="/audio/demo.mp3"
                    preload="metadata"
                    onLoadedMetadata={() => {
                      const audio = audioRef.current
                      if (audio) setDuration(audio.duration || 0)
                    }}
                    onTimeUpdate={() => {
                      const audio = audioRef.current
                      if (audio) setCurrentTime(audio.currentTime)
                    }}
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    onEnded={() => {
                      const audio = audioRef.current
                      if (audio) audio.currentTime = 0
                      setCurrentTime(0)
                      setIsPlaying(false)
                    }}
                  />
                  <div className="flex items-center gap-4">
                    <Button
                      onClick={togglePlay}
                      size="icon"
                      className="w-14 h-14 rounded-full bg-accent hover:bg-accent/90 flex-shrink-0"
                    >
                      {isPlaying ? (
                        <Pause className="w-6 h-6 text-accent-foreground" />
                      ) : (
                        <Play className="w-6 h-6 text-accent-foreground ml-0.5" />
                      )}
                    </Button>

                    <div className="flex-1 min-w-0">
                      <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="absolute left-0 top-0 h-full bg-accent rounded-full transition-all duration-100"
                          style={{ width: `${(currentTime / duration) * 100}%` }}
                        />
                      </div>
                      <div className="flex justify-between mt-2 text-sm text-muted-foreground">
                        <span>{formatTime(currentTime)}</span>
                        <span>{formatTime(duration)}</span>
                      </div>
                    </div>

                    <Volume2 className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                  </div>

                  {/* Waveform visualization */}
                  <div className="mt-6 flex items-center justify-center gap-0.5 h-16">
                    {[...Array(40)].map((_, i) => (
                      <div
                        key={i}
                        className={`w-1 rounded-full transition-all duration-150 ${
                          isPlaying ? 'bg-accent' : 'bg-muted-foreground/20'
                        }`}
                        style={{
                          height: isPlaying 
                            ? `${Math.random() * 40 + 12}px` 
                            : `${Math.sin(i * 0.3) * 16 + 24}px`,
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Chat Transcript */}
              <div
                className="reveal-item p-6 md:p-8"
                style={{ "--reveal-delay": "340ms" } as CSSProperties}
              >
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-3 h-3 rounded-full bg-accent animate-pulse" />
                  <span className="font-semibold text-foreground">Transkript</span>
                </div>

                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {chatMessages.map((msg, index) => (
                    <div
                      key={index}
                      className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                          msg.type === 'user'
                            ? 'bg-primary text-primary-foreground rounded-br-md'
                            : 'bg-secondary text-foreground rounded-bl-md'
                        }`}
                      >
                        <p className="text-sm leading-relaxed">{msg.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </ScrollReveal>
    </>
  )
}
