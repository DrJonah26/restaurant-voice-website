import Link from "next/link"
import { CONTACT_ROUTE } from "@/lib/contact"
import { BrandLogo } from "@/components/brand-logo"

type FooterLink = {
  label: string
  href: string
}

const footerLinks: Record<string, FooterLink[]> = {
  Produkt: [
    { label: "Features", href: "#" },
    { label: "Preise", href: "#" },
    { label: "Demo", href: "#" },
  ],
  Unternehmen: [
    { label: "Über uns", href: "#" },
    { label: "Kontakt", href: CONTACT_ROUTE },
    { label: "Karriere", href: "#" },
  ],
  Ressourcen: [
    { label: "Dokumentation", href: "#" },
    { label: "Help Center", href: "#" },
    { label: "Fallstudien", href: "#" },
  ],
  Rechtliches: [
    { label: "Datenschutz", href: "#" },
    { label: "AGB", href: "#" },
    { label: "Impressum", href: "#" },
  ],
}

export function Footer() {
  return (
    <footer className="bg-card border-t border-border py-16">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="inline-flex items-center mb-4">
              <BrandLogo size="md" />
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Die intelligente Lösung für Restaurant-Telefonie.
            </p>
          </div>

          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="font-semibold text-foreground mb-4">{category}</h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">© 2024 JoydeAI. Alle Rechte vorbehalten.</p>
          <div className="flex items-center gap-6">
            <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
              LinkedIn
            </Link>
            <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
              Instagram
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
