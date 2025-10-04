// OpenAI API Key Setup Helper
// This script helps you set up your OpenAI API key

console.log('🔑 OpenAI API Key Setup Helper');
console.log('================================\n');

console.log('📋 Steps to get your OpenAI API key:');
console.log('');
console.log('1. 🌐 Go to: https://platform.openai.com/api-keys');
console.log('2. 🔐 Sign up or log in to your OpenAI account');
console.log('3. ➕ Click "Create new secret key"');
console.log('4. 📝 Give it a name like "EthioHeritage360"');
console.log('5. 💰 Add billing information (required for API usage)');
console.log('6. 📋 Copy the API key (starts with sk-...)');
console.log('7. ✏️ Replace "your_real_openai_api_key_here" in your .env file');
console.log('');

console.log('⚠️  IMPORTANT NOTES:');
console.log('');
console.log('• OpenAI API requires a paid account with billing setup');
console.log('• Free tier gives you $5 credit for first 3 months');
console.log('• GPT-3.5-turbo costs about $0.002 per 1K tokens');
console.log('• Your current placeholder key will not work');
console.log('');

console.log('📁 Your .env file location:');
console.log('   C:\\Users\\think\\Desktop\\Project-for-G25\\backend\\.env');
console.log('');

console.log('🔧 After adding your real API key:');
console.log('1. Save the .env file');
console.log('2. Run: node test-openai.js (to test)');
console.log('3. Deploy to Render with the new key');
console.log('');

// Test current API key
const fs = require('fs');
const path = require('path');

try {
    const envPath = path.join(__dirname, '.env');
    const envContent = fs.readFileSync(envPath, 'utf8');
    
    const apiKeyLine = envContent.split('\n').find(line => 
        line.startsWith('OPENAI_API_KEY=') && !line.startsWith('#')
    );
    
    if (apiKeyLine) {
        const currentKey = apiKeyLine.split('=')[1];
        
        console.log('🔍 Current API Key Status:');
        if (currentKey === 'your_real_openai_api_key_here') {
            console.log('❌ Placeholder key detected - needs replacement');
        } else if (currentKey.startsWith('sk-')) {
            console.log('✅ Real API key format detected');
            console.log(`   Key: ${currentKey.substring(0, 20)}...`);
        } else {
            console.log('⚠️  Invalid key format');
        }
    }
} catch (error) {
    console.log('⚠️  Could not read .env file');
}

console.log('');
console.log('💡 Need help? The OpenAI API costs are very reasonable:');
console.log('   - Basic chat: ~$0.002 per message');
console.log('   - 1000 messages ≈ $2.00');
console.log('   - Perfect for your heritage chatbot!');
console.log('');
console.log('🚀 Once set up, your AI chatbot will work perfectly!');
