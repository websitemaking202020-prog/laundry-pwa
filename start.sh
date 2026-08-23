#!/bin/bash

echo "🧺 LaundryLink PWA - Quick Start"
echo "================================"
echo ""

# Check if config is set up
CONFIG_FILE="js/config.js"

if grep -q "YOUR_SUPABASE_URL" "$CONFIG_FILE"; then
    echo "⚠️  Configuration needed!"
    echo ""
    echo "Please follow these steps:"
    echo "1. Open setup.html in your browser for detailed instructions"
    echo "2. Set up Supabase, OneSignal, and Cloudflare Turnstile"
    echo "3. Update js/config.js with your API keys"
    echo ""
    echo "Opening setup guide..."

    # Try to open setup.html in default browser
    if command -v xdg-open > /dev/null; then
        xdg-open setup.html
    elif command -v open > /dev/null; then
        open setup.html
    else
        echo "Please open setup.html in your browser manually."
    fi

    echo ""
    echo "After configuration, run this script again to start the server."
    exit 0
fi

echo "✓ Configuration found!"
echo ""

# Try to find a suitable server
if command -v python3 > /dev/null; then
    echo "🚀 Starting local server on http://localhost:8000"
    echo ""
    echo "Opening browser..."
    sleep 2

    # Open browser
    if command -v xdg-open > /dev/null; then
        xdg-open http://localhost:8000
    elif command -v open > /dev/null; then
        open http://localhost:8000
    fi

    echo ""
    echo "Press Ctrl+C to stop the server"
    echo ""
    python3 -m http.server 8000
elif command -v python > /dev/null; then
    echo "🚀 Starting local server on http://localhost:8000"
    echo ""
    echo "Opening browser..."
    sleep 2

    # Open browser
    if command -v xdg-open > /dev/null; then
        xdg-open http://localhost:8000
    elif command -v open > /dev/null; then
        open http://localhost:8000
    fi

    echo ""
    echo "Press Ctrl+C to stop the server"
    echo ""
    python -m http.server 8000
elif command -v npx > /dev/null; then
    echo "🚀 Starting local server with npx serve"
    echo ""
    npx serve .
else
    echo "❌ No suitable server found!"
    echo ""
    echo "Please install one of these:"
    echo "  • Python: python -m http.server 8000"
    echo "  • Node.js: npx serve ."
    echo "  • Or deploy to Netlify/Vercel"
    echo ""
fi
