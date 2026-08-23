// This script replaces {{VARIABLE}} placeholders with actual environment variables
const fs = require('fs');
const path = require('path');

// Read the config template
const configPath = path.join(__dirname, 'js', 'config.js');
let configContent = fs.readFileSync(configPath, 'utf8');

// Replace placeholders with environment variables
configContent = configContent
    .replace('{{SUPABASE_URL}}', process.env.SUPABASE_URL || 'YOUR_SUPABASE_URL')
    .replace('{{SUPABASE_ANON_KEY}}', process.env.SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY')
    .replace('{{ONESIGNAL_APP_ID}}', process.env.ONESIGNAL_APP_ID || 'YOUR_ONESIGNAL_APP_ID')
    .replace('{{TURNSTILE_SITE_KEY}}', process.env.TURNSTILE_SITE_KEY || '1x00000000000000000000AA');

// Write the processed config
fs.writeFileSync(configPath, configContent);

console.log('✓ Environment variables injected into config.js');
