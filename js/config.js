// ⚙️ Configuration - Replace with your actual API keys

const CONFIG = {
    // Supabase Configuration
    supabase: {
        url: 'YOUR_SUPABASE_URL', // e.g., https://xxxxx.supabase.co
        anonKey: 'YOUR_SUPABASE_ANON_KEY'
    },

    // OneSignal Configuration
    oneSignal: {
        appId: 'YOUR_ONESIGNAL_APP_ID'
    },

    // Cloudflare Turnstile Configuration
    turnstile: {
        siteKey: 'YOUR_TURNSTILE_SITE_KEY'
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
