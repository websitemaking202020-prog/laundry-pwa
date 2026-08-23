// ⚙️ Configuration Validator and Setup Helper
// This checks if your API keys are properly configured

function validateConfig() {
    const errors = [];
    const warnings = [];

    // Check Supabase
    if (!CONFIG.supabase.url || CONFIG.supabase.url.includes('YOUR_') || CONFIG.supabase.url.includes('{{')) {
        errors.push('❌ Supabase URL not configured');
    }
    if (!CONFIG.supabase.anonKey || CONFIG.supabase.anonKey.includes('YOUR_') || CONFIG.supabase.anonKey.includes('{{')) {
        errors.push('❌ Supabase Anon Key not configured');
    }

    // Check OneSignal (warning only)
    if (!CONFIG.oneSignal.appId || CONFIG.oneSignal.appId.includes('YOUR_') || CONFIG.oneSignal.appId.includes('{{')) {
        warnings.push('⚠️ OneSignal not configured - Push notifications disabled');
    }

    // Check Turnstile (warning only)
    if (!CONFIG.turnstile.siteKey || CONFIG.turnstile.siteKey.includes('YOUR_') || CONFIG.turnstile.siteKey.includes('{{')) {
        warnings.push('⚠️ Turnstile not configured - Using test mode');
    }

    return { errors, warnings, isValid: errors.length === 0 };
}

// Show setup instructions if not configured
function showSetupInstructions() {
    const validation = validateConfig();

    if (!validation.isValid) {
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.9);
            z-index: 9999;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        `;

        overlay.innerHTML = `
            <div style="background: white; padding: 40px; border-radius: 20px; max-width: 600px; max-height: 90vh; overflow-y: auto;">
                <h2 style="color: #EF4444; margin-bottom: 20px;">⚠️ Configuration Required</h2>

                <div style="background: #FEE2E2; padding: 15px; border-radius: 10px; margin-bottom: 20px;">
                    ${validation.errors.map(err => `<p style="margin: 5px 0;">${err}</p>`).join('')}
                </div>

                ${validation.warnings.length > 0 ? `
                <div style="background: #FEF3C7; padding: 15px; border-radius: 10px; margin-bottom: 20px;">
                    ${validation.warnings.map(warn => `<p style="margin: 5px 0;">${warn}</p>`).join('')}
                </div>
                ` : ''}

                <h3 style="margin-top: 30px; color: #4F46E5;">Quick Setup:</h3>

                <div style="background: #F3F4F6; padding: 20px; border-radius: 10px; margin: 15px 0;">
                    <h4>1. Setup Supabase (Required)</h4>
                    <ol style="margin-left: 20px; line-height: 1.8;">
                        <li>Go to <a href="https://supabase.com" target="_blank" style="color: #4F46E5;">supabase.com</a></li>
                        <li>Create new project (wait 2 mins)</li>
                        <li>SQL Editor → Run <code>supabase-schema.sql</code></li>
                        <li>Settings → API → Copy URL & anon key</li>
                        <li>Add to Vercel Environment Variables</li>
                    </ol>
                </div>

                <div style="background: #F3F4F6; padding: 20px; border-radius: 10px; margin: 15px 0;">
                    <h4>2. Setup OneSignal (Optional - for notifications)</h4>
                    <ol style="margin-left: 20px; line-height: 1.8;">
                        <li>Go to <a href="https://onesignal.com" target="_blank" style="color: #4F46E5;">onesignal.com</a></li>
                        <li>Create Web Push app</li>
                        <li>Copy App ID</li>
                        <li>Add to Vercel Environment Variables</li>
                    </ol>
                </div>

                <div style="background: #F3F4F6; padding: 20px; border-radius: 10px; margin: 15px 0;">
                    <h4>3. Setup Turnstile (Optional - for security)</h4>
                    <ol style="margin-left: 20px; line-height: 1.8;">
                        <li>Go to <a href="https://dash.cloudflare.com" target="_blank" style="color: #4F46E5;">Cloudflare Dashboard</a></li>
                        <li>Turnstile → Add Site</li>
                        <li>Copy Site Key</li>
                        <li>Add to Vercel Environment Variables</li>
                    </ol>
                    <p style="margin-top: 10px;"><strong>For testing:</strong> Use key <code>1x00000000000000000000AA</code></p>
                </div>

                <div style="background: #DBEAFE; padding: 20px; border-radius: 10px; margin: 15px 0;">
                    <h4>📝 In Vercel:</h4>
                    <p>Go to your project → Settings → Environment Variables</p>
                    <p style="margin-top: 10px;">Add these variables:</p>
                    <ul style="margin-left: 20px; line-height: 1.8;">
                        <li><code>SUPABASE_URL</code></li>
                        <li><code>SUPABASE_ANON_KEY</code></li>
                        <li><code>ONESIGNAL_APP_ID</code></li>
                        <li><code>TURNSTILE_SITE_KEY</code></li>
                    </ul>
                </div>

                <button onclick="window.location.href='setup.html'" style="
                    width: 100%;
                    padding: 15px;
                    background: #4F46E5;
                    color: white;
                    border: none;
                    border-radius: 10px;
                    font-size: 16px;
                    font-weight: 600;
                    cursor: pointer;
                    margin-top: 20px;
                ">Open Full Setup Guide</button>

                <p style="text-align: center; margin-top: 15px; color: #6B7280; font-size: 14px;">
                    This app won't work until Supabase is configured
                </p>
            </div>
        `;

        document.body.appendChild(overlay);
        return false;
    }

    // Show warnings only
    if (validation.warnings.length > 0) {
        console.warn('LaundryLink Configuration Warnings:');
        validation.warnings.forEach(w => console.warn(w));
    }

    return true;
}

// Check configuration on load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(showSetupInstructions, 500);
    });
} else {
    setTimeout(showSetupInstructions, 500);
}
