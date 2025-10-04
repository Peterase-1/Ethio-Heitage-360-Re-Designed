# 🚀 Render Deployment Instructions for EthioHeritage360

## ⚠️ IMPORTANT: Fix these issues before deployment

### 1. OpenAI API Key Setup (CRITICAL)
Your backend won't work without this!

1. **Get OpenAI API Key:**
   - Go to https://platform.openai.com/api-keys
   - Sign up or login to OpenAI
   - Click "Create new secret key"
   - Copy the key (starts with `sk-...`)

2. **Set in Render Dashboard:**
   - Go to your Render service dashboard
   - Navigate to "Environment" tab
   - Find `OPENAI_API_KEY` variable
   - Paste your real OpenAI API key there
   - Click "Save Changes"

### 2. Environment Variables Required in Render Dashboard

Set these in your Render service environment variables:

```
NODE_ENV=production
PORT=10000
MONGODB_URI=mongodb+srv://melkamuwako5_db_user:YFweyhElTJBj5sXp@cluster0.x3jfm8p.mongodb.net/ethioheritage360?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=ethioheritage360_production_jwt_secret_2024_very_long_and_secure_key_abcdef123456
OPENAI_API_KEY=[YOUR_ACTUAL_OPENAI_API_KEY_HERE]
FRONTEND_URL=https://ethioheritage360-ethiopianheritagepf.netlify.app
RENDER_EXTERNAL_URL=https://ethioheritage360-ethiopian-heritage.onrender.com
```

### 3. Fixed Configuration Files

✅ **render.yaml** - Now points to `backend/` directory (fixed)
✅ **start-server.bat** - Now uses `backend/` directory (fixed)  
✅ **package.json** - All scripts now point to `backend/` (fixed)

### 4. UptimeRobot Setup

Your server keeps sleeping because it's on Render's free tier. Here's how to fix it:

1. **Add these endpoints to UptimeRobot:**
   - Health Check: `https://ethioheritage360-ethiopian-heritage.onrender.com/api/health`
   - Keep Alive: `https://ethioheritage360-ethiopian-heritage.onrender.com/api/render/ping`

2. **UptimeRobot Settings:**
   - Monitor Type: HTTP(s)
   - Monitoring Interval: Every 5 minutes
   - Keyword Monitoring: Look for "OK" in response

3. **Alternative: Use the built-in keep-alive system:**
   The backend already has a self-ping system that runs every 14 minutes on free tier.

### 5. After Deployment

Test these endpoints:
- Health: https://ethioheritage360-ethiopian-heritage.onrender.com/api/health
- OpenAI Status: https://ethioheritage360-ethiopian-heritage.onrender.com/api/openai/status
- Chat Test: https://ethioheritage360-ethiopian-heritage.onrender.com/api/chat (POST)

### 6. Troubleshooting

If your server still doesn't work:

1. **Check Render Logs:**
   - Go to Render Dashboard → Your Service → Logs
   - Look for error messages

2. **Common Issues:**
   - ❌ `OpenAI API key not configured` → Add OPENAI_API_KEY to environment variables
   - ❌ `MongoDB connection error` → Check MONGODB_URI
   - ❌ `CORS errors` → Check FRONTEND_URL matches your Netlify domain

3. **Test Locally First:**
   - Run `start-server.bat` 
   - Check http://localhost:5001/api/health
   - Verify all environment variables are set

---

## 🎯 Quick Fix Checklist

- [ ] Set real OpenAI API key in Render dashboard
- [ ] Verify all environment variables in Render
- [ ] Push the updated code to trigger new deployment
- [ ] Check deployment logs for errors
- [ ] Test health endpoint after deployment
- [ ] Set up UptimeRobot monitoring

**Remember:** The main issue was that Render was looking in the wrong directory (`server/` instead of `backend/`). This is now fixed!
