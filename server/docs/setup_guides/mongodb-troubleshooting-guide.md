# MongoDB Atlas & Render Deployment Troubleshooting Guide

## Primary Fix: Update Environment Variables
1. **Go to Render Dashboard** → Your Service → **Environment Tab**
2. **Update MONGODB_URI** to:
   ```
   mongodb+srv://melkamuwako5:zW1pMgTkc4BkyFTp@ethioheritage360.tuhmybp.mongodb.net/ethioheritage360?retryWrites=true&w=majority&appName=ethioheritage360
   ```
3. **Save Changes** (this will trigger automatic redeployment)

## If the Issue Persists:

### 1. Check MongoDB Atlas Cluster Status
- **Login to MongoDB Atlas**: https://cloud.mongodb.com
- **Navigate to your cluster**: ethioheritage360
- **Verify cluster is running** (not paused due to inactivity)
- **Check if the cluster is in the correct region**

### 2. Verify Network Access in MongoDB Atlas
- **Go to MongoDB Atlas** → **Network Access**
- **Ensure** `0.0.0.0/0` is in the IP Access List (allows access from anywhere)
- **Or add Render's IP ranges** if you want to be more restrictive

### 3. Verify Database User in MongoDB Atlas
- **Go to MongoDB Atlas** → **Database Access**
- **Check user** `melkamuwako5` exists and has correct permissions
- **Verify password** is `zW1pMgTkc4BkyFTp`
- **Ensure user has** `readWrite` permissions on `ethioheritage360` database

### 4. Check Render Service Settings
- **Go to Render Dashboard** → Your Service → **Settings**
- **Verify**:
  - Runtime: `Node`
  - Build Command: `npm install`
  - Start Command: `npm start`
  - Region: Choose closest to your MongoDB Atlas cluster

### 5. Monitor Deployment Logs
- **Go to Render Dashboard** → Your Service → **Logs**
- **Look for**:
  ```
  ✅ MongoDB Connected: ethioheritage360.tuhmybp.mongodb.net
  📊 Database: ethioheritage360
  🔗 Connection Status: connected
  ```

### 6. Test Connection Locally First
Before deploying to Render, test the connection locally:
```bash
cd server
node -e "
const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://melkamuwako5:zW1pMgTkc4BkyFTp@ethioheritage360.tuhmybp.mongodb.net/ethioheritage360?retryWrites=true&w=majority&appName=ethioheritage360')
.then(() => console.log('✅ Connected'))
.catch(err => console.error('❌ Error:', err.message))
"
```

## Common Error Messages and Solutions:

### `bad auth : authentication failed`
- **Cause**: Wrong username/password
- **Solution**: Update MongoDB Atlas user password or update connection string

### `MongoNetworkTimeoutError`
- **Cause**: Network connectivity issues or cluster paused
- **Solution**: Check cluster status and network access settings

### `MongoServerSelectionTimeoutError`
- **Cause**: Cannot reach MongoDB servers
- **Solution**: Verify cluster is running and network access is configured

## Quick Fix Commands for Render:

If you prefer using Render CLI:
```bash
# Install Render CLI
npm install -g @render/cli

# Login to Render
render login

# Update environment variable
render env set MONGODB_URI="mongodb+srv://melkamuwako5:zW1pMgTkc4BkyFTp@ethioheritage360.tuhmybp.mongodb.net/ethioheritage360?retryWrites=true&w=majority&appName=ethioheritage360"
```

## Success Indicators:
When the fix works, you should see in Render logs:
```
✅ MongoDB Connected: ethioheritage360.tuhmybp.mongodb.net
📊 Database: ethioheritage360
Server running on port 10000 in production mode
Health check available at http://localhost:10000/api/health
```
