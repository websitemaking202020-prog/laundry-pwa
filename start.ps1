# Quick Start Script for LaundryLink

Write-Host "🧺 LaundryLink PWA - Quick Start" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Check if config is set up
$configFile = "js/config.js"
$configContent = Get-Content $configFile -Raw

if ($configContent -match "YOUR_SUPABASE_URL") {
    Write-Host "⚠️  Configuration needed!" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Please follow these steps:" -ForegroundColor White
    Write-Host "1. Open setup.html in your browser for detailed instructions"
    Write-Host "2. Set up Supabase, OneSignal, and Cloudflare Turnstile"
    Write-Host "3. Update js/config.js with your API keys"
    Write-Host ""
    Write-Host "Opening setup guide..." -ForegroundColor Green
    Start-Process "setup.html"
    Write-Host ""
    Write-Host "After configuration, run this script again to start the server." -ForegroundColor Cyan
    exit
}

Write-Host "✓ Configuration found!" -ForegroundColor Green
Write-Host ""

# Check for Python
$pythonExists = Get-Command python -ErrorAction SilentlyContinue

if ($pythonExists) {
    Write-Host "🚀 Starting local server on http://localhost:8000" -ForegroundColor Green
    Write-Host ""
    Write-Host "Opening browser..." -ForegroundColor Cyan
    Start-Sleep -Seconds 2
    Start-Process "http://localhost:8000"
    Write-Host ""
    Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
    Write-Host ""
    python -m http.server 8000
} else {
    Write-Host "❌ Python not found!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please install Python or use one of these alternatives:" -ForegroundColor Yellow
    Write-Host "  • npm: npx serve ."
    Write-Host "  • Deploy to Netlify/Vercel"
    Write-Host "  • Use any other local server"
    Write-Host ""
}
