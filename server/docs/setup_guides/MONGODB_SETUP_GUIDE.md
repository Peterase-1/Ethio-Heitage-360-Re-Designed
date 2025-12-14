# MongoDB Local Setup Guide for Windows

## Option 1: Install MongoDB Community Server (Recommended)

### Step 1: Download MongoDB
1. Go to https://www.mongodb.com/try/download/community
2. Select "Windows" as your platform
3. Choose "msi" installer
4. Download the installer

### Step 2: Install MongoDB
1. Run the downloaded .msi file
2. Choose "Complete" installation
3. **Important**: During installation, make sure to:
   - Install MongoDB as a Service (checked)
   - Install MongoDB Compass (GUI tool, optional but recommended)

### Step 3: Verify Installation
Open PowerShell as Administrator and run:
```powershell
mongod --version
```

### Step 4: Start MongoDB Service
MongoDB should start automatically as a Windows service. If not:
```powershell
net start MongoDB
```

## Option 2: Alternative - Use Docker (If you have Docker installed)

### Run MongoDB in Docker
```powershell
docker run -d --name mongodb -p 27017:27017 -e MONGO_INITDB_ROOT_USERNAME=admin -e MONGO_INITDB_ROOT_PASSWORD=password mongo:latest
```

## Option 3: Quick Setup - Use MongoDB Memory Server for Development

If you prefer not to install MongoDB system-wide, I can modify the code to use an in-memory database for development.

## After MongoDB Installation

1. MongoDB will run on default port: `27017`
2. Default connection string: `mongodb://localhost:27017/ethioheritage360`
3. No authentication required for local development

## Next Steps

After MongoDB is installed and running, I'll:
1. Update the `.env` file to use the local connection
2. Create seed data for the virtual museum
3. Start the server

## Verify MongoDB is Running

Open Command Prompt and run:
```cmd
mongosh
```
or
```cmd
mongo
```

If successful, you'll see the MongoDB shell prompt.
