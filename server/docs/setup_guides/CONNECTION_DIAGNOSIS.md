# MongoDB Atlas Connection Diagnosis

## 🔍 Current Issue
❌ **DNS Resolution Failure**: Cannot resolve `ethioheritage360.tuhmybp.mongodb.net`
❌ **Connection Status**: ETIMEOUT errors
📍 **Your IP**: 196.188.252.156

## 🛠️ Immediate Troubleshooting Steps

### Step 1: Verify Your Atlas Cluster URL
**IMPORTANT**: Double-check your connection string in MongoDB Atlas:

1. **Log into Atlas**: https://cloud.mongodb.com/
2. **Go to Database → Connect**
3. **Click "Connect your application"**
4. **Copy the NEW connection string** and compare with ours

**Current URL we're using**: `ethioheritage360.tuhmybp.mongodb.net`

### Step 2: Check Atlas Network Configuration

#### A. IP Access List (Critical!)
1. **Network Access → IP Access List**
2. **Verify these are added**:
   - `196.188.252.156/32` (your specific IP)
   - OR `0.0.0.0/0` (allow from anywhere)
3. **Status should be "ACTIVE"** (not pending)

#### B. Database Users
1. **Database Access → Database Users**
2. **Verify user exists**:
   - Username: `peterasegid`
   - Password: `92XMTZu3Adqkov5S`
   - Role: `readWriteAnyDatabase` or `Atlas admin`

### Step 3: Check Cluster Status
1. **Database → Clusters**
2. **Verify cluster is**:
   - ✅ **Running** (not paused)
   - ✅ **Healthy** (no alerts)
   - ✅ **M0 Sandbox or higher** (not expired)

### Step 4: Network Troubleshooting

#### Try Alternative DNS Servers
```powershell
# Option 1: Change DNS to Google DNS
netsh interface ip set dns "Wi-Fi" static 8.8.8.8
netsh interface ip add dns "Wi-Fi" 8.8.4.4 index=2

# Option 2: Change DNS to Cloudflare
netsh interface ip set dns "Wi-Fi" static 1.1.1.1
netsh interface ip add dns "Wi-Fi" 1.0.0.1 index=2
```

#### Test Different Connection String
Try this simplified version without database name:
```javascript
mongodb+srv://peterasegid:92XMTZu3Adqkov5S@ethioheritage360.tuhmybp.mongodb.net/?retryWrites=true&w=majority
```

## 🔧 Alternative Solutions

### Solution 1: Use Mobile Hotspot
1. **Connect your computer to mobile hotspot**
2. **Test connection** to bypass network restrictions
3. **If it works**: Your home/office network blocks MongoDB

### Solution 2: Check Firewall
```powershell
# Check if Windows Firewall is blocking
Get-NetFirewallProfile | Select-Object Name, Enabled
```

### Solution 3: Try Different Port/Protocol
Some networks block MongoDB's default ports. Try:
1. **Using VPN**
2. **Contacting your ISP/Network admin**
3. **Using a different network**

## 🧪 Quick Tests

### Test 1: Basic Connectivity
```bash
node quick-test.js
```

### Test 2: Alternative Connection String
Create `test-alt.js`:
```javascript
const mongoose = require('mongoose');

const uri = 'mongodb+srv://peterasegid:92XMTZu3Adqkov5S@ethioheritage360.tuhmybp.mongodb.net/?retryWrites=true&w=majority';

mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 })
.then(() => console.log('✅ Connected!'))
.catch(err => console.error('❌ Failed:', err.message));
```

## 🚨 If Nothing Works

### Contact MongoDB Support
1. **Create support ticket** in Atlas dashboard
2. **Include these details**:
   - Cluster name: ethioheritage360
   - Your IP: 196.188.252.156
   - Error: DNS resolution failure
   - Network provider/country

### Use MongoDB Compass (GUI Tool)
1. **Download MongoDB Compass**
2. **Try connecting with same credentials**
3. **This can help identify if it's a Node.js specific issue**

## 📞 Next Steps
1. **Verify cluster URL** in Atlas dashboard
2. **Try mobile hotspot test**
3. **Check with network administrator**
4. **Consider using MongoDB Compass for testing**
