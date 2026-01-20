export const STRIPE_PLANS = {
    basic: {
        name: 'Basic',
        price: 30,
        priceId: process.env.STRIPE_BASIC_PRICE_ID || '',
        calls: 300,
        features: [
            '300 Anrufe/Monat',
            'Automatische Reservierungen',
            '24/7 Erreichbarkeit',
            'E-Mail Benachrichtigungen',
            'Basis Analytics',
        ],
    },
    professional: {
        name: 'Professional',
        price: 60,
        priceId: process.env.STRIPE_PROFESSIONAL_PRICE_ID || '',
        calls: 700,
        features: [
            '700 Anrufe/Monat',
            'Automatische Reservierungen',
            '24/7 Erreichbarkeit',
            'E-Mail & SMS Benachrichtigungen',
            'Erweiterte Analytics',
            'Priorität Support',
            'Custom Voice Agent',
        ],
    },
    custom: {
        name: 'Custom',
        price: 0,
        priceId: '',
        calls: 0,
        features: [
            'Unbegrenzte Anrufe',
            'Alle Professional Features',
            'Dedicated Account Manager',
            'Custom Integration',
            'SLA Garantie',
        ],
    },
} as const
