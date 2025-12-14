# MongoDB Atlas Connection Troubleshooting

## Current Status
❌ **Connection Failed**: ETIMEOUT error when connecting to Atlas
✅ **Credentials**: Configured correctly
🔍 **Your Current IP**: 196.188.252.156

## Immediate Actions Required

### 1. 🚨 CRITICAL: Update IP Whitelist in MongoDB Atlas

1. **Log into MongoDB Atlas**: https://cloud.mongodb.com/
2. **Navigate to Network Access**:
   - Click on "Network Access" in the left sidebar
   - Click on "IP Access List" tab
3. **Add Your Current IP**:
   - Click "+ ADD IP ADDRESS"
   - Add: `196.188.252.156/32`
   - Or for development, add: `0.0.0.0/0` (allows access from anywhere)
4. **Save and Wait**: Changes can take 1-2 minutes to propagate

### 2. ✅ Verify Database User Permissions

1. **Go to Database Access**:
   - Click "Database Access" in the left sidebar
2. **Check User**: `peterasegid`
   - Should have `readWrite` role on `ethioheritage360` database
   - If user doesn't exist, create it with these credentials:
     - Username: `peterasegid`
     - Password: `92XMTZu3Adqkov5S`
     - Database User Privileges: `Read and write to any database`

### 3. 🔄 Verify Cluster Status

1. **Check Cluster Health**:
   - Go to "Database" (Clusters) section
   - Ensure your cluster `ethioheritage360` is:
     - ✅ Running (not paused)
     - ✅ Accessible
     - ✅ No ongoing maintenance

## Test Connection After Changes

```bash
# Wait 2-3 minutes after making Atlas changes, then test:
node test-db-connection.js
```

## Alternative Connection Test

If the above doesn't work, try this simplified test:

```javascript
// Create: quick-test.js
const mongoose = require('mongoose');

const uri = 'mongodb+srv://peterasegid:92XMTZu3Adqkov5S@ethioheritage360.tuhmybp.mongodb.net/?retryWrites=true&w=majority';

mongoose.connect(uri, { 
  useNewUrlParser: true, 
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 10000
})
.then(() => {
  console.log('✅ Connected to Atlas!');
  mongoose.disconnect();
})
.catch(err => {
  console.error('❌ Connection failed:', err.message);
});
```

## Common Solutions

### If Still Getting ETIMEOUT:
1. **Check Firewall**: Corporate/home firewall might block MongoDB ports
2. **Try Different Network**: Test from mobile hotspot
3. **VPN Issues**: Disable VPN if active

### If Getting Authentication Error:
1. **Verify credentials** in Database Access
2. **Check password** for special characters
3. **Recreate user** if necessary

### If DNS Resolution Fails:
1. **Try Alternative DNS**: 8.8.8.8 or 1.1.1.1
2. **Flush DNS Cache**: `ipconfig /flushdns`
3. **Check Internet Connection**

## Success Checklist
- [ ] IP `196.188.252.156` added to Atlas IP whitelist
- [ ] User `peterasegid` exists with proper permissions
- [ ] Cluster is running and accessible
- [ ] Connection test passes: `node test-db-connection.js`

## Next Steps After Success
1. Start your server: `node server.js`
2. Test health endpoint: http://localhost:5000/api/health
3. Verify your application can perform database operations
