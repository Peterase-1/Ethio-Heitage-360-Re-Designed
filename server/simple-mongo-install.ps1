# Simple MongoDB Tools Installation Script
Write-Host "🚀 MongoDB Atlas Tools Installation" -ForegroundColor Green
Write-Host "==================================" -ForegroundColor Green
Write-Host ""

# Create downloads directory
$downloadsDir = "$env:USERPROFILE\Desktop\MongoDB-Tools"
Write-Host "📁 Creating directory: $downloadsDir" -ForegroundColor Yellow
New-Item -ItemType Directory -Path $downloadsDir -Force | Out-Null

# Download MongoDB Compass
Write-Host "📥 Downloading MongoDB Compass..." -ForegroundColor Yellow
$compassUrl = "https://downloads.mongodb.com/compass/mongodb-compass-1.40.4-win32-x64.msi"
$compassFile = "$downloadsDir\mongodb-compass.msi"

try {
    Invoke-WebRequest -Uri $compassUrl -OutFile $compassFile -UseBasicParsing
    Write-Host "✅ MongoDB Compass downloaded!" -ForegroundColor Green
    
    Write-Host "🔧 Starting MongoDB Compass installer..." -ForegroundColor Yellow
    Start-Process -FilePath $compassFile
    Write-Host "✅ Installer started!" -ForegroundColor Green
    
} catch {
    Write-Host "❌ Download failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Download MongoDB Shell
Write-Host ""
Write-Host "📥 Downloading MongoDB Shell..." -ForegroundColor Yellow
$mongoshUrl = "https://downloads.mongodb.com/compass/mongosh-2.1.1-win32-x64.zip"
$mongoshFile = "$downloadsDir\mongosh.zip"

try {
    Invoke-WebRequest -Uri $mongoshUrl -OutFile $mongoshFile -UseBasicParsing
    Write-Host "✅ MongoDB Shell downloaded!" -ForegroundColor Green
    
    Write-Host "🔧 Extracting MongoDB Shell..." -ForegroundColor Yellow
    Expand-Archive -Path $mongoshFile -DestinationPath "$downloadsDir\mongosh" -Force
    Write-Host "✅ MongoDB Shell extracted!" -ForegroundColor Green
    
} catch {
    Write-Host "❌ Download/Extract failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Create connection info file
$connectionInfo = @"
MongoDB Atlas Connection Information
=====================================

Your Database Details:
- Database: ethioheritage360
- Collections: 58 collections
- Status: Live and operational

Connection String:
mongodb+srv://melkamuwako5_db_user:YFweyhElTJBj5sXp@cluster0.x3jfm8p.mongodb.net/ethioheritage360?retryWrites=true&w=majority&appName=Cluster0

How to Connect:

1. MongoDB Compass (GUI):
   - Open MongoDB Compass
   - Paste the connection string above
   - Click "Connect"

2. MongoDB Shell (Command Line):
   - Navigate to: $downloadsDir\mongosh\mongosh-2.1.1-win32-x64\bin
   - Run: mongosh.exe "mongodb+srv://melkamuwako5_db_user:YFweyhElTJBj5sXp@cluster0.x3jfm8p.mongodb.net/ethioheritage360"

3. Google Cloud Shell (If local connection fails):
   - Go to: https://console.cloud.google.com
   - Open Cloud Shell
   - Install mongosh and connect

Basic Commands Once Connected:
- show collections
- db.users.countDocuments()
- db.stats()
- db.users.findOne()

"@

$infoFile = "$downloadsDir\Connection-Info.txt"
$connectionInfo | Out-File -FilePath $infoFile -Encoding UTF8

Write-Host ""
Write-Host "🎉 INSTALLATION COMPLETED!" -ForegroundColor Green
Write-Host "=========================" -ForegroundColor Green
Write-Host ""
Write-Host "📁 Files saved to: $downloadsDir" -ForegroundColor Cyan
Write-Host "📋 Connection info: $infoFile" -ForegroundColor Yellow
Write-Host ""
Write-Host "🚀 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Complete MongoDB Compass installation" -ForegroundColor White
Write-Host "2. Open MongoDB Compass and connect using the connection string" -ForegroundColor White
Write-Host "3. Or use MongoDB Shell from the extracted folder" -ForegroundColor White
Write-Host ""
Write-Host "✨ Ready to explore your database!" -ForegroundColor Green

# Open the downloads folder
Start-Process -FilePath $downloadsDir
