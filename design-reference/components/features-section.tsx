import { Phone, Calendar, Clock, MessageSquare, BarChart3, Globe } from "lucide-react"

const features = [
  {
    icon: Phone,
    title: "Natural Conversations",
    description: "Advanced AI that speaks naturally and handles complex requests with ease, just like your best staff member.",
  },
  {
    icon: Calendar,
    title: "Smart Scheduling",
    description: "Intelligent reservation management that optimizes table turnover and prevents double-bookings automatically.",
  },
  {
    icon: Clock,
    title: "24/7 Availability",
    description: "Never miss a booking. Your AI receptionist handles calls around the clock, even during peak hours.",
  },
  {
    icon: MessageSquare,
    title: "Multi-Language",
    description: "Communicate with guests in their preferred language. Support for 20+ languages out of the box.",
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    description: "Real-time insights into call volumes, booking patterns, and customer preferences to optimize operations.",
  },
  {
    icon: Globe,
    title: "POS Integration",
    description: "Seamlessly connects with popular restaurant systems like OpenTable, Resy, and your existing POS.",
  },
]

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 bg-secondary/30">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <span className="text-sm font-medium text-accent uppercase tracking-wider">Features</span>
          <h2 className="mt-4 text-3xl md:text-5xl font-bold text-foreground text-balance">
            Everything Your Restaurant Needs
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Powerful features designed specifically for the hospitality industry.
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
