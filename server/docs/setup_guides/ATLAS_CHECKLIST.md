# MongoDB Atlas Connection Checklist

## Your Connection String
```
mongodb+srv://<db_username>:<db_password>@ethioheritage360.tuhmybp.mongodb.net/ethioheritage360?retryWrites=true&w=majority&appName=ethioheritage360
```

## ✅ Steps to Complete

### 1. Update Credentials in .env file
- [ ] Replace `<db_username>` with your actual username
- [ ] Replace `<db_password>` with your actual password
- [ ] If password has special characters, URL-encode them:
  - `@` → `%40`
  - `#` → `%23`  
  - `%` → `%25`
  - `+` → `%2B`
  - `/` → `%2F`

### 2. Check MongoDB Atlas Settings
- [ ] **Network Access**: Add your IP address to IP Access List
  - Go to Network Access → IP Access List
  - Add current IP or `0.0.0.0/0` for development
- [ ] **Database Access**: Ensure user exists with proper permissions
  - Go to Database Access → Database Users
  - User should have `readWrite` permissions on the database

### 3. Test Connection
```bash
node test-db-connection.js
```

### 4. Common Issues & Solutions

**ETIMEOUT Error:**
- Check IP whitelist in Atlas
- Verify internet connection
- Check if corporate firewall blocks MongoDB ports

**Authentication Failed:**
- Verify username/password are correct
- Check if password needs URL encoding
- Ensure user has proper database permissions

**ENOTFOUND Error:**
- Check cluster URL is correct
- Verify DNS resolution

## Quick Test Commands

Test connection:
```bash
node test-db-connection.js
```

Start server:
```bash
node server.js
```

Check server health:
```bash
# In another terminal or browser
curl http://localhost:5000/api/health
```

## Success Indicators
✅ Connection test shows "MongoDB Connected Successfully!"
✅ Server starts without connection errors
✅ Health endpoint returns status "OK"
