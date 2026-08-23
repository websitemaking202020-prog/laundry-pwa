// ⚙️ Configuration - Environment variables loaded from Vercel
// You don't need to edit this file!

const CONFIG = {
    // Supabase Configuration
    supabase: {
        url: '{{SUPABASE_URL}}',
        anonKey: '{{SUPABASE_ANON_KEY}}'
    },

    // OneSignal Configuration
    oneSignal: {
        appId: '{{ONESIGNAL_APP_ID}}'
    },

    // Cloudflare Turnstile Configuration
    turnstile: {
        siteKey: '{{TURNSTILE_SITE_KEY}}'
    }
};

// Service pricing (can be moved to database later)
const SERVICE_PRICING = {
    'wash_fold': 5.00,      // per kg
    'wash_iron': 7.50,      // per kg
    'dry_clean': 12.00,     // per kg
    'iron_only': 3.00       // per kg
};

const SERVICE_NAMES = {
    'wash_fold': 'Wash & Fold',
    'wash_iron': 'Wash & Iron',
    'dry_clean': 'Dry Clean',
    'iron_only': 'Iron Only'
};
