# MongoDB Atlas Setup Guide

## Current Status
- ✅ Local MongoDB connection working
- ❌ MongoDB Atlas not configured

## Steps to Connect to MongoDB Atlas

### 1. Get Your Atlas Connection String
1. Log into [MongoDB Atlas](https://cloud.mongodb.com/)
2. Navigate to your cluster
3. Click **"Connect"** button
4. Choose **"Connect your application"**
5. Select **"Node.js"** as your driver
6. Copy the connection string

### 2. Update Environment Variables
Replace the MONGODB_URI in your `.env` file:

```env
# Comment out or remove the local connection
# MONGODB_URI=mongodb://localhost:27017/ethioheritage360

# Add your Atlas connection string
MONGODB_URI=mongodb+srv://your_username:your_password@your_cluster.mongodb.net/ethioheritage360?retryWrites=true&w=majority
```

**Important**: Replace the following in the connection string:
- `your_username` - Your MongoDB Atlas username
- `your_password` - Your MongoDB Atlas password  
- `your_cluster` - Your cluster name
- `ethioheritage360` - Your database name

### 3. Configure Atlas Security Settings

#### IP Whitelist
1. In Atlas, go to **Network Access** → **IP Access List**
2. Add your current IP address, OR
3. Add `0.0.0.0/0` to allow access from anywhere (less secure, but good for development)

#### Database User
1. Go to **Database Access** → **Database Users**
2. Ensure you have a user with read/write permissions
3. Note the username and password for the connection string

### 4. Test the Connection
Run the test script to verify your Atlas connection:

```bash
node test-db-connection.js
```

### 5. Common Issues and Solutions

#### Connection Timeouts
- Check your IP whitelist in Atlas
- Verify your internet connection
- Try increasing timeout values in the connection options

#### Authentication Errors
- Verify username and password in connection string
- Check user permissions in Database Access
- Ensure special characters in password are URL-encoded

#### Network Issues
- Check if your network blocks MongoDB Atlas ports
- Try connecting from a different network
- Contact your network administrator if needed

### 6. Security Best Practices
- Use environment variables for sensitive data
- Don't commit connection strings to version control
- Use specific IP addresses instead of 0.0.0.0/0 when possible
- Regularly rotate database passwords

## Testing Commands

Test local connection:
```bash
node test-db-connection.js
```

Start your server:
```bash
npm start
# or
node server.js
```

Check server health:
```bash
curl http://localhost:5000/api/health
```
