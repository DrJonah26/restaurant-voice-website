# Voice AI Restaurant Assistent

Eine vollständige SaaS-Website für einen Voice AI Restaurant-Assistenten mit Next.js 14, TypeScript, Supabase und Stripe.

## Features

- 🎯 **Landing Page** mit Hero, Features, Demo Audio, Pricing und FAQ
- 🔐 **Authentifizierung** mit Supabase (Email/Password + Google OAuth)
- 📝 **Onboarding** Multi-Step Flow für neue Benutzer
- 📊 **Dashboard** mit Übersicht, Statistiken und Quick Actions
- 📅 **Reservierungen** Verwaltung mit Filter, Suche und Tabelle
- ⚙️ **Einstellungen** für Restaurant, Voice Agent und Telefon
- 📈 **Analytics** mit Charts und KPIs
- 💳 **Abrechnung** mit Stripe Integration

## Tech Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS** + **Shadcn UI**
- **Supabase** (Auth + Database)
- **Stripe** (Payments)
- **Framer Motion** (Animations)
- **Recharts** (Charts)
- **React Hook Form** + **Zod** (Form Validation)

## Setup

1. **Dependencies installieren:**
```bash
npm install
```

2. **Umgebungsvariablen konfigurieren:**
Erstellen Sie eine `.env.local` Datei basierend auf `.env.example`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
NEXT_PUBLIC_STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

3. **Supabase Datenbank Setup:**
Erstellen Sie die folgenden Tabellen in Supabase:

```sql
-- Restaurants Tabelle
CREATE TABLE restaurants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  type TEXT DEFAULT 'restaurant',
  opening_time TIME DEFAULT '09:00',
  closing_time TIME DEFAULT '22:00',
  max_capacity INTEGER DEFAULT 50,
  closed_days TEXT[] DEFAULT '{}',
  voice TEXT DEFAULT 'female-1',
  language TEXT DEFAULT 'de',
  greeting_text TEXT,
  call_forwarding BOOLEAN DEFAULT false,
  plan TEXT DEFAULT 'basic',
  onboarding_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reservierungen Tabelle
CREATE TABLE reservations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT,
  party_size INTEGER NOT NULL,
  reservation_date TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;

-- Restaurants: User kann nur eigene Daten sehen/bearbeiten
CREATE POLICY "Users can view own restaurants"
  ON restaurants FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own restaurants"
  ON restaurants FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own restaurants"
  ON restaurants FOR UPDATE
  USING (auth.uid() = user_id);

-- Reservierungen: User kann nur Reservierungen seiner Restaurants sehen
CREATE POLICY "Users can view own reservations"
  ON reservations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM restaurants
      WHERE restaurants.id = reservations.restaurant_id
      AND restaurants.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own reservations"
  ON reservations FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM restaurants
      WHERE restaurants.id = reservations.restaurant_id
      AND restaurants.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own reservations"
  ON reservations FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM restaurants
      WHERE restaurants.id = reservations.restaurant_id
      AND restaurants.user_id = auth.uid()
    )
  );
```

4. **Stripe Setup:**
- Erstellen Sie Produkte und Preise in Stripe Dashboard
- Fügen Sie die Price IDs zu `lib/stripe.ts` hinzu
- Konfigurieren Sie Webhooks für `/api/stripe/webhook`

5. **Development Server starten:**
```bash
npm run dev
```

Die Anwendung läuft dann auf [http://localhost:3000](http://localhost:3000)

## Projektstruktur

```
app/
├── (auth)/              # Auth Pages
│   ├── login/
│   ├── signup/
│   └── callback/
├── (marketing)/         # Marketing Pages
│   └── page.tsx        # Landing Page
├── onboarding/         # Onboarding Flow
├── dashboard/          # Dashboard Pages
│   ├── layout.tsx      # Sidebar Layout
│   ├── page.tsx        # Übersicht
│   ├── reservations/   # Reservierungen
│   ├── settings/       # Einstellungen
│   ├── analytics/      # Analytics
│   └── billing/        # Abrechnung
└── api/                # API Routes
    └── stripe/         # Stripe Integration

components/
├── ui/                 # Shadcn UI Components
└── theme-provider.tsx  # Theme Provider

lib/
├── supabase.ts         # Supabase Client
├── stripe.ts           # Stripe Config
└── utils.ts            # Utilities
```

## Wichtige Features

- ✅ Vollständige Authentifizierung mit Supabase
- ✅ Protected Routes für Dashboard
- ✅ Onboarding nur einmal anzeigen
- ✅ Responsive Design (Mobile-first)
- ✅ Loading States überall
- ✅ Error Handling mit Toast Notifications
- ✅ Form Validation mit Zod + React Hook Form
- ✅ Dark Mode Support
- ✅ Smooth Animations mit Framer Motion

## Nächste Schritte

- [ ] Supabase Datenbank Tabellen erstellen
- [ ] Stripe Produkte und Preise konfigurieren
- [ ] Google OAuth in Supabase aktivieren
- [ ] Webhook Endpoint für Stripe konfigurieren
- [ ] Demo Audio Datei hinzufügen
- [ ] Echte Daten statt Mock Data verwenden

## Lizenz

MIT
