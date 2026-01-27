"use client"

import { useState, useRef, useEffect } from "react"
import { Play, Pause, Volume2, Mic, Phone, Settings, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"

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
  { type: "user", text: "Hallo, ich würde gern für heute Abend reservieren.", time: "0:02" },
  { type: "ai", text: "Sehr gerne! Für wie viele Personen und welche Uhrzeit?", time: "0:05" },
  { type: "user", text: "4 Personen um 19:30 Uhr, bitte.", time: "0:09" },
  { type: "ai", text: "Perfekt! Ich habe noch einen Tisch frei. Darf ich Ihren Namen notieren?", time: "0:12" },
  { type: "user", text: "Sarah Müller.", time: "0:15" },
  { type: "ai", text: "Super, Sarah! Der Tisch für 4 Personen um 19:30 Uhr ist bestätigt. Bis später!", time: "0:18" },
]

export function HowItWorksSection() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(22)
  const [activeMessage, setActiveMessage] = useState(-1)
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

  useEffect(() => {
    const timeToSeconds = (time: string) => {
      const [mins, secs] = time.split(':').map(Number)
      return mins * 60 + secs
    }
    
    const currentMessage = chatMessages.findIndex((msg, index) => {
      const msgTime = timeToSeconds(msg.time)
      const nextTime = index < chatMessages.length - 1 
        ? timeToSeconds(chatMessages[index + 1].time)
        : duration
      return currentTime >= msgTime && currentTime < nextTime
    })
    
    setActiveMessage(currentMessage)
  }, [currentTime, duration])

  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60)
    const secs = Math.floor(time % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <>
      {/* Steps Section */}
      <section id="how-it-works" className="py-20 bg-background">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-14">
            <span className="text-sm font-medium text-accent uppercase tracking-wider">So funktioniert's</span>
            <h2 className="mt-3 text-3xl md:text-4xl font-bold text-foreground text-balance">
              In wenigen Minuten startklar
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step) => (
              <div key={step.number} className="relative">
                <div className="bg-card border border-border rounded-2xl p-6 h-full hover:shadow-lg hover:border-accent/30 transition-all">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                      <step.icon className="w-6 h-6 text-accent" />
                    </div>
                    <span className="text-3xl font-bold text-muted-foreground/30">{step.number}</span>
                  </div>
                  <h3 className="font-semibold text-foreground text-lg mb-2">{step.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section id="demo" className="py-20 bg-secondary/30">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <span className="text-sm font-medium text-accent uppercase tracking-wider">Live Demo</span>
            <h2 className="mt-3 text-3xl md:text-4xl font-bold text-foreground text-balance">
              Hören Sie selbst
            </h2>
            <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
              Ein echtes Gespräch zwischen Gast und KI-Assistentin.
            </p>
          </div>

          <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-lg">
            <div className="grid md:grid-cols-2">
              {/* Audio Player */}
              <div className="p-6 md:p-8 border-b md:border-b-0 md:border-r border-border">
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
              <div className="p-6 md:p-8">
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
                        } ${activeMessage === index ? 'ring-2 ring-accent' : ''}`}
                      >
                        <p className="text-sm leading-relaxed">{msg.text}</p>
                        <span className={`text-xs mt-1.5 block ${
                          msg.type === 'user' ? 'text-primary-foreground/70' : 'text-muted-foreground'
                        }`}>
                          {msg.time}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
