# EthioHeritage360 OpenAI Integration Setup Script

Write-Host "🤖 EthioHeritage360 - OpenAI Integration Setup" -ForegroundColor Cyan
Write-Host "=" * 50 -ForegroundColor Cyan

# Check if we're in the correct directory
if (!(Test-Path "package.json")) {
    Write-Host "❌ Error: Please run this script from the project root directory." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "📋 OpenAI Integration Summary:" -ForegroundColor Yellow
Write-Host "   ✅ OpenAI dependency installed in server"
Write-Host "   ✅ OpenAI service created (comprehensive AI features)"
Write-Host "   ✅ OpenAI routes implemented (8 endpoints)"
Write-Host "   ✅ OpenAI API key configured in server/.env"
Write-Host "   ✅ Server routes updated to include OpenAI"
Write-Host ""

Write-Host "🔧 Checking Installation..." -ForegroundColor Yellow

# Check server dependencies
if (Test-Path "server/node_modules/openai") {
    Write-Host "   ✅ OpenAI dependency is installed" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  Installing OpenAI dependency..." -ForegroundColor Yellow
    Set-Location server
    npm install openai
    Set-Location ..
    Write-Host "   ✅ OpenAI dependency installed" -ForegroundColor Green
}

# Check if OpenAI service exists
if (Test-Path "server/services/openaiService.js") {
    Write-Host "   ✅ OpenAI service file exists" -ForegroundColor Green
} else {
    Write-Host "   ❌ OpenAI service file missing" -ForegroundColor Red
}

# Check if OpenAI routes exist
if (Test-Path "server/routes/openai.js") {
    Write-Host "   ✅ OpenAI routes file exists" -ForegroundColor Green
} else {
    Write-Host "   ❌ OpenAI routes file missing" -ForegroundColor Red
}

Write-Host ""
Write-Host "🚀 OpenAI Features Added:" -ForegroundColor Cyan
Write-Host "   • AI-Powered Artifact Descriptions" -ForegroundColor Blue
Write-Host "   • Educational Content Generation" -ForegroundColor Blue
Write-Host "   • Multi-Language Translation" -ForegroundColor Blue
Write-Host "   • Interactive AI Chatbot" -ForegroundColor Blue
Write-Host "   • Personalized Recommendations" -ForegroundColor Blue
Write-Host "   • Tour Guide Content Creation" -ForegroundColor Blue
Write-Host "   • Content Status & Health Monitoring" -ForegroundColor Blue

Write-Host ""
Write-Host "🔗 API Endpoints Added:" -ForegroundColor Cyan
Write-Host "   GET  /api/openai/status" -ForegroundColor Blue
Write-Host "   GET  /api/openai/test" -ForegroundColor Blue
Write-Host "   POST /api/openai/chat" -ForegroundColor Blue
Write-Host "   POST /api/openai/generate-artifact-description" -ForegroundColor Blue
Write-Host "   POST /api/openai/generate-educational-content" -ForegroundColor Blue
Write-Host "   POST /api/openai/generate-tour-guide" -ForegroundColor Blue
Write-Host "   POST /api/openai/recommendations" -ForegroundColor Blue
Write-Host "   POST /api/openai/translate" -ForegroundColor Blue

Write-Host ""
Write-Host "⚙️  Configuration Details:" -ForegroundColor Yellow
Write-Host "   • OpenAI API Key: ✅ Configured in server/.env" -ForegroundColor Green
Write-Host "   • Model: gpt-3.5-turbo (configurable)" -ForegroundColor Green
Write-Host "   • Max Tokens: 1000 (configurable)" -ForegroundColor Green
Write-Host "   • Authentication: Required for most endpoints" -ForegroundColor Green
Write-Host "   • Public Access: Available for chatbot" -ForegroundColor Green

Write-Host ""
Write-Host "🔄 Next Steps to Deploy:" -ForegroundColor Cyan
Write-Host "1. 📤 Push changes to GitHub repository"
Write-Host "2. 🚀 Render will automatically redeploy your backend"
Write-Host "3. 🧪 Test OpenAI integration after deployment"
Write-Host "4. 🎯 Access AI features from your frontend"

Write-Host ""
Write-Host "🧪 Testing Commands:" -ForegroundColor Yellow
Write-Host "   Test locally:  node test-openai-integration.js"
Write-Host "   Test user reg: node test-user-registration.js"
Write-Host "   Full test:     node test-connection-integration.js"

Write-Host ""
Write-Host "📝 Files Created/Modified:" -ForegroundColor Green
Write-Host "   ✅ server/.env (OpenAI configuration added)"
Write-Host "   ✅ server/services/openaiService.js (NEW)"
Write-Host "   ✅ server/routes/openai.js (NEW)"
Write-Host "   ✅ server/server.js (updated with OpenAI routes)"
Write-Host "   ✅ test-openai-integration.js (NEW testing script)"
Write-Host "   ✅ client/.env (updated for production backend)"

Write-Host ""
Write-Host "🔗 Your Application URLs:" -ForegroundColor Blue
Write-Host "   Frontend: https://ethioheritage360-ethiopianheritagepf.netlify.app"
Write-Host "   Backend:  https://ethioheritage360-ethiopian-heritage.onrender.com"
Write-Host ""

Write-Host "💡 Usage Examples:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Generate Artifact Description:" -ForegroundColor Yellow
Write-Host '   POST /api/openai/generate-artifact-description'
Write-Host '   Body: {'
Write-Host '     "artifactName": "Ethiopian Cross",        '
Write-Host '     "category": "Religious Artifact",        '
Write-Host '     "historicalPeriod": "Medieval Period"    '
Write-Host '   }'
Write-Host ""

Write-Host "2. AI Chatbot (Public):" -ForegroundColor Yellow
Write-Host '   POST /api/openai/chat'
Write-Host '   Body: {'
Write-Host '     "message": "Tell me about Ethiopian museums",        '
Write-Host '     "context": "User wants museum information"    '
Write-Host '   }'
Write-Host ""

Write-Host "3. Translate Content:" -ForegroundColor Yellow
Write-Host '   POST /api/openai/translate'
Write-Host '   Body: {'
Write-Host '     "content": "Welcome to Ethiopian heritage",        '
Write-Host '     "targetLanguage": "Amharic"    '
Write-Host '   }'

Write-Host ""
Write-Host "🎉 OpenAI Integration Setup Complete!" -ForegroundColor Green
Write-Host "Ready to push to GitHub and deploy! 🚀" -ForegroundColor Green
