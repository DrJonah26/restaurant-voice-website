"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Check, Phone, Clock, DollarSign, Play, ArrowRight } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-secondary/20">
      {/* Navigation */}
      <nav className="border-b border-border/50 glass sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="text-2xl font-bold text-primary">VoiceAI Restaurant</div>
          <div className="flex items-center gap-4">
            <Link href="/auth/login">
              <Button variant="ghost">Anmelden</Button>
            </Link>
            <Link href="/auth/signup">
              <Button>Kostenlos testen</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
            Nie wieder verpasste Anrufe in Ihrem Restaurant
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            KI beantwortet Telefonate, bucht Tische, entlastet Ihr Team - 24/7
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signup">
              <Button size="lg" className="text-lg px-8">
                Kostenlos testen
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="text-lg px-8">
              <Play className="mr-2 h-5 w-5" />
              Demo anhören
            </Button>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="grid md:grid-cols-3 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Card className="h-full glass-card border-border/50 hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/10">
              <CardHeader>
                <Clock className="h-12 w-12 text-primary mb-4" />
                <CardTitle>24/7 Erreichbar</CardTitle>
                <CardDescription>
                  Ihre KI-Assistentin ist rund um die Uhr verfügbar und verpasst keinen Anruf mehr, auch außerhalb der Öffnungszeiten.
                </CardDescription>
              </CardHeader>
            </Card>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="h-full border-2 hover:border-primary transition-colors">
              <CardHeader>
                <Phone className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Automatische Reservierungen</CardTitle>
                <CardDescription>
                  Reservierungen werden automatisch in Ihr System übernommen. Keine manuelle Eingabe mehr nötig.
                </CardDescription>
              </CardHeader>
            </Card>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="h-full border-2 hover:border-primary transition-colors">
              <CardHeader>
                <DollarSign className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Spart ihre Zeit & ihr Geld</CardTitle>
                <CardDescription>
                  Reduzieren Sie Personalkosten und steigern Sie gleichzeitig die Kundenzufriedenheit durch sofortige Antworten.
                </CardDescription>
              </CardHeader>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Demo Audio Section */}
      <section className="container mx-auto px-4 py-20 glass-card rounded-3xl my-20 border-border/50">
        <h2 className="text-4xl font-bold text-center mb-12">Hören Sie selbst</h2>
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Beispiel-Gespräch</CardTitle>
              <CardDescription>Ein typisches Gespräch mit unserer KI-Assistentin</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-background rounded-lg p-6 border">
                <audio controls className="w-full">
                  <source src="/demo-audio.mp3" type="audio/mpeg" />
                  Ihr Browser unterstützt das Audio-Element nicht.
                </audio>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Transkript</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-background rounded-lg p-6 border max-h-96 overflow-y-auto">
                <div className="space-y-4 text-sm">
                  <div>
                    <p className="font-semibold text-primary">KI-Assistentin:</p>
                    <p>"Guten Tag! Herzlich willkommen bei [Restaurant Name]. Wie kann ich Ihnen heute helfen?"</p>
                  </div>
                  <div>
                    <p className="font-semibold text-muted-foreground">Anrufer:</p>
                    <p>"Hallo, ich würde gerne einen Tisch für heute Abend reservieren."</p>
                  </div>
                  <div>
                    <p className="font-semibold text-primary">KI-Assistentin:</p>
                    <p>"Gerne! Für wie viele Personen soll der Tisch sein?"</p>
                  </div>
                  <div>
                    <p className="font-semibold text-muted-foreground">Anrufer:</p>
                    <p>"Für 4 Personen bitte."</p>
                  </div>
                  <div>
                    <p className="font-semibold text-primary">KI-Assistentin:</p>
                    <p>"Perfekt! Für welche Uhrzeit hätten Sie gerne den Tisch? Wir haben noch Plätze um 18:00, 19:30 und 21:00 Uhr frei."</p>
                  </div>
                  <div>
                    <p className="font-semibold text-muted-foreground">Anrufer:</p>
                    <p>"19:30 Uhr wäre super!"</p>
                  </div>
                  <div>
                    <p className="font-semibold text-primary">KI-Assistentin:</p>
                    <p>"Ausgezeichnet! Darf ich noch Ihren Namen und Ihre Telefonnummer haben?"</p>
                  </div>
                  <div>
                    <p className="font-semibold text-muted-foreground">Anrufer:</p>
                    <p>"Max Mustermann, 0123 456789"</p>
                  </div>
                  <div>
                    <p className="font-semibold text-primary">KI-Assistentin:</p>
                    <p>"Vielen Dank! Ihre Reservierung für heute Abend um 19:30 Uhr für 4 Personen ist bestätigt. Wir freuen uns auf Ihren Besuch!"</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-4xl font-bold text-center mb-12">Preise</h2>
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Basic Plan */}
          <Card className="glass-card border-border/50 hover:border-primary/50 transition-all">
            <CardHeader>
              <CardTitle>Basic</CardTitle>
              <CardDescription>Für kleine Restaurants</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold">0€</span>
                <span className="text-muted-foreground"> / 7 Tage testen</span>
              </div>
              <div className="mt-2">
                <span className="text-2xl font-bold">30€</span>
                <span className="text-muted-foreground"> / Monat danach</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-primary" />
                  <span>300 Anrufe/Monat</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-primary" />
                  <span>Automatische Reservierungen</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-primary" />
                  <span>24/7 Erreichbarkeit</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-primary" />
                  <span>E-Mail Benachrichtigungen</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-primary" />
                  <span>Basis Analytics</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-primary" />
                  <span>Perfekt für Kunden außerhalb der Öffnungszeiten</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Link href="/auth/signup" className="w-full">
                <Button className="w-full">Plan wählen</Button>
              </Link>
            </CardFooter>
          </Card>

          {/* Professional Plan */}
          <Card className="glass-card border-2 border-primary/50 relative hover:border-primary transition-all shadow-lg shadow-primary/20">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
              <span className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-semibold">
                Empfohlen
              </span>
            </div>
            <CardHeader>
              <CardTitle>Professional</CardTitle>
              <CardDescription>Für Vollzeit-Betrieb</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold">60€</span>
                <span className="text-muted-foreground"> / Monat</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-primary" />
                  <span>700 Anrufe/Monat</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-primary" />
                  <span>Automatische Reservierungen</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-primary" />
                  <span>24/7 Erreichbarkeit</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-primary" />
                  <span>E-Mail & SMS Benachrichtigungen</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-primary" />
                  <span>Erweiterte Analytics</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-primary" />
                  <span>Priorität Support</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-primary" />
                  <span>Custom Voice Agent</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-primary" />
                  <span>KI übernimmt dauerhaft</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Link href="/auth/signup" className="w-full">
                <Button className="w-full">Plan wählen</Button>
              </Link>
            </CardFooter>
          </Card>

          {/* Custom Plan */}
          <Card className="glass-card border-border/50 hover:border-primary/50 transition-all">
            <CardHeader>
              <CardTitle>Custom</CardTitle>
              <CardDescription>Für große Restaurants</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold">Individuell</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-primary" />
                  <span>Unbegrenzte Anrufe</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-primary" />
                  <span>Alle Professional Features</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-primary" />
                  <span>Dedicated Account Manager</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-primary" />
                  <span>Custom Integration</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-primary" />
                  <span>SLA Garantie</span>
                </li>
              </ul>
              <p className="mt-4 text-sm text-muted-foreground">
                Sie benötigen mehr Anrufe? Kontaktieren Sie uns und wir handeln gemeinsam einen Preis/Anruf aus.
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                Kontaktieren Sie uns
              </Button>
            </CardFooter>
          </Card>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-4xl font-bold text-center mb-12">Häufig gestellte Fragen</h2>
        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>Wie funktioniert die KI-Assistentin?</AccordionTrigger>
              <AccordionContent>
                Unsere KI-Assistentin nutzt fortschrittliche Sprachverarbeitung, um Anrufe zu verstehen und zu beantworten. 
                Sie kann Reservierungen entgegennehmen, Fragen beantworten und Informationen weitergeben - alles automatisch.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>Kann ich die KI-Assistentin anpassen?</AccordionTrigger>
              <AccordionContent>
                Ja! Im Professional und Custom Plan können Sie die Stimme, Sprache und Begrüßungstexte anpassen. 
                So passt sich die KI-Assistentin perfekt an Ihr Restaurant an.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>Was passiert, wenn ich mein Anruf-Limit überschreite?</AccordionTrigger>
              <AccordionContent>
                Sie werden benachrichtigt, wenn Sie sich Ihrem Limit nähern. Bei Überschreitung können Sie entweder 
                auf einen höheren Plan upgraden oder zusätzliche Anrufe einzeln kaufen.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-4">
              <AccordionTrigger>Wie werden Reservierungen in mein System übernommen?</AccordionTrigger>
              <AccordionContent>
                Reservierungen werden automatisch in Ihr Dashboard übernommen und Sie erhalten eine E-Mail-Benachrichtigung. 
                Sie können die Reservierungen auch in Ihr bestehendes System integrieren.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-5">
              <AccordionTrigger>Kann ich die Testversion verlängern?</AccordionTrigger>
              <AccordionContent>
                Die 7-tägige Testversion kann nicht verlängert werden, aber Sie können jederzeit auf einen kostenpflichtigen Plan upgraden.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 glass mt-20">
        <div className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">VoiceAI Restaurant</h3>
              <p className="text-muted-foreground">
                Die intelligente Lösung für Ihr Restaurant.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Produkt</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><Link href="#" className="hover:text-foreground">Features</Link></li>
                <li><Link href="#" className="hover:text-foreground">Preise</Link></li>
                <li><Link href="#" className="hover:text-foreground">Demo</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Unternehmen</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><Link href="#" className="hover:text-foreground">Über uns</Link></li>
                <li><Link href="#" className="hover:text-foreground">Kontakt</Link></li>
                <li><Link href="#" className="hover:text-foreground">Karriere</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Rechtliches</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><Link href="#" className="hover:text-foreground">Datenschutz</Link></li>
                <li><Link href="#" className="hover:text-foreground">AGB</Link></li>
                <li><Link href="#" className="hover:text-foreground">Impressum</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t text-center text-muted-foreground">
            <p>&copy; 2024 VoiceAI Restaurant. Alle Rechte vorbehalten.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
