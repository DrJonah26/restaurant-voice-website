export const TRIAL_DURATION_DAYS = 7
export const TRIAL_CALLS_LIMIT = 50

export const STRIPE_PLANS = {
    basic: {


        name: 'Basic',


        price: 30,


        priceId: process.env.STRIPE_BASIC_PRICE_ID || '',


        calls: 300,


        features: [


            "300 Anrufe/Monat",


            "Automatische Reservierungen",


            "24/7 Erreichbarkeit",


            "E-Mail Benachrichtigungen",


            "Dashboard mit Übersicht, Einstellungen und Analyse",


            "Perfekt für Anrufe außerhalb der Öffnungszeiten",


        ],


    },


    professional: {


        name: 'Professional',


        price: 60,


        priceId: process.env.STRIPE_PROFESSIONAL_PRICE_ID || '',


        calls: 700,


        features: [


            "700 Anrufe/Monat",


            "Automatische Reservierungen",


            "24/7 Erreichbarkeit",


            "E-Mail Benachrichtigungen",


            "Dashboard mit  Übersicht, Einstellungen und erweiterter Analyse",


            "Priorität Support",


            "KI kann kann dauerhaft übernehmen",


        ],


    },


    custom: {

        name: 'Custom',

        price: 0,

        priceId: '',

        calls: 0,

        features: [],

        helper:

            'Sie benötigen mehr Anrufe und Features? Sprechen sie uns direkt auf ihre Wünsche an!',

    },

} as const

