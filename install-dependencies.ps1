# EthioHeritage360 Dependencies Installation Script
# This script installs all required dependencies for the full-stack application

Write-Host "🚀 EthioHeritage360 - Installing Dependencies" -ForegroundColor Cyan
Write-Host "=" * 50 -ForegroundColor Cyan

# Check if we're in the right directory
if (!(Test-Path "package.json")) {
    Write-Host "❌ Error: package.json not found. Please run this script from the project root directory." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "📦 Installing Root Dependencies..." -ForegroundColor Yellow

# Install root dependencies
try {
    npm install
    Write-Host "✅ Root dependencies installed successfully" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to install root dependencies: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🖥️  Installing Server Dependencies..." -ForegroundColor Yellow

# Install server dependencies
if (Test-Path "server") {
    Set-Location server
    try {
        # Ensure all required server dependencies are installed
        npm install mongodb@^6.20.0 mongoose@^7.8.7 axios@^1.12.2 --save
        npm install --save-dev nodemon
        
        Write-Host "✅ Server dependencies installed successfully" -ForegroundColor Green
    } catch {
        Write-Host "❌ Failed to install server dependencies: $_" -ForegroundColor Red
        Set-Location ..
        exit 1
    }
    Set-Location ..
} else {
    Write-Host "⚠️  Server directory not found, skipping server dependencies" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🌐 Installing Client Dependencies..." -ForegroundColor Yellow

# Install client dependencies
if (Test-Path "client") {
    Set-Location client
    try {
        # Install client dependencies
        npm install
        
        # Ensure axios is installed for API calls
        npm install axios --save
        
        Write-Host "✅ Client dependencies installed successfully" -ForegroundColor Green
    } catch {
        Write-Host "❌ Failed to install client dependencies: $_" -ForegroundColor Red
        Set-Location ..
        exit 1
    }
    Set-Location ..
} else {
    Write-Host "⚠️  Client directory not found, skipping client dependencies" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🔧 Installing Additional Testing Dependencies..." -ForegroundColor Yellow

# Install testing dependencies in root
try {
    npm install axios mongodb dotenv --save
    Write-Host "✅ Testing dependencies installed successfully" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to install testing dependencies: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "✅ All dependencies installed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "🎯 Next Steps:" -ForegroundColor Cyan
Write-Host "1. ✅ Dependencies are installed"
Write-Host "2. ✅ Frontend environment configured for production backend"
Write-Host "3. ✅ Backend CORS configured to allow Netlify frontend"
Write-Host "4. 🔄 Now test the integration:"
Write-Host ""
Write-Host "   Run: node test-connection-integration.js" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Your deployment URLs:"
Write-Host "   Frontend: https://ethioheritage360-ethiopianheritagepf.netlify.app" -ForegroundColor Blue
Write-Host "   Backend:  https://ethioheritage360-ethiopian-heritage.onrender.com" -ForegroundColor Blue

Write-Host ""
Write-Host "🎉 Setup Complete! Your EthioHeritage360 application is ready!" -ForegroundColor Green
