"use client"

import { useState, useRef, useEffect } from "react"
import { Play, Pause, Volume2, Mic, Phone, Settings, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"

const steps = [
  {
    number: "01",
    title: "Connect Your Number",
    description: "Forward your existing restaurant phone line to Reseva or get a new dedicated number in minutes.",
    icon: Phone,
  },
  {
    number: "02",
    title: "Customize Your AI",
    description: "Set your restaurant's hours, menu details, special requests handling, and conversation style.",
    icon: Settings,
  },
  {
    number: "03",
    title: "Go Live",
    description: "Your AI receptionist starts handling calls immediately. Review transcripts and bookings in real-time.",
    icon: Zap,
  },
]

const chatMessages = [
  { type: "user", text: "Hi, I'd like to make a reservation for tonight.", time: "0:02" },
  { type: "ai", text: "Of course! How many guests and what time works best for you?", time: "0:05" },
  { type: "user", text: "4 people at 7:30 PM please.", time: "0:09" },
  { type: "ai", text: "Perfect! I have a table available. May I have a name for the reservation?", time: "0:12" },
  { type: "user", text: "Sarah Johnson.", time: "0:15" },
  { type: "ai", text: "Wonderful, Sarah! Your table for 4 is confirmed for tonight at 7:30 PM. We look forward to seeing you!", time: "0:18" },
]

export function HowItWorksSection() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration] = useState(22)
  const [activeMessage, setActiveMessage] = useState(-1)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const togglePlay = () => {
    if (isPlaying) {
      if (intervalRef.current) clearInterval(intervalRef.current)
      setIsPlaying(false)
    } else {
      setIsPlaying(true)
      intervalRef.current = setInterval(() => {
        setCurrentTime(prev => {
          if (prev >= duration) {
            if (intervalRef.current) clearInterval(intervalRef.current)
            setIsPlaying(false)
            return 0
          }
          return prev + 0.1
        })
      }, 100)
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

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

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
            <span className="text-sm font-medium text-accent uppercase tracking-wider">How It Works</span>
            <h2 className="mt-3 text-3xl md:text-4xl font-bold text-foreground text-balance">
              Up and Running in Minutes
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
      <section className="py-20 bg-secondary/30">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <span className="text-sm font-medium text-accent uppercase tracking-wider">Live Demo</span>
            <h2 className="mt-3 text-3xl md:text-4xl font-bold text-foreground text-balance">
              Hear It in Action
            </h2>
            <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
              Listen to a real conversation between a customer and your AI receptionist.
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
                    <h4 className="font-semibold text-foreground">Live Demo Call</h4>
                    <p className="text-sm text-muted-foreground">Listen to a real AI conversation</p>
                  </div>
                </div>

                <div className="bg-secondary rounded-xl p-5">
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
                  <span className="font-semibold text-foreground">Transcript</span>
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
