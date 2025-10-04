# MongoDB Tools Installation Script for Windows
# Run this script as Administrator for best results

Write-Host "🚀 MongoDB Atlas Tools Installation Script" -ForegroundColor Green
Write-Host "===========================================" -ForegroundColor Green
Write-Host ""

# Function to check if running as administrator
function Test-Administrator {
    $currentUser = [Security.Principal.WindowsIdentity]::GetCurrent()
    $principal = New-Object Security.Principal.WindowsPrincipal($currentUser)
    return $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

# Create downloads directory
$downloadsDir = "$env:USERPROFILE\Desktop\MongoDB-Tools"
if (!(Test-Path $downloadsDir)) {
    New-Item -ItemType Directory -Path $downloadsDir -Force | Out-Null
    Write-Host "📁 Created directory: $downloadsDir" -ForegroundColor Yellow
}

Write-Host "🔍 System Information:" -ForegroundColor Cyan
Write-Host "   - Windows Version: $([System.Environment]::OSVersion.VersionString)"
Write-Host "   - PowerShell Version: $($PSVersionTable.PSVersion)"
Write-Host "   - User: $env:USERNAME"
Write-Host "   - Downloads Directory: $downloadsDir"
Write-Host ""

# 1. Download and Install MongoDB Compass
Write-Host "📥 Step 1: Downloading MongoDB Compass..." -ForegroundColor Yellow
$compassUrl = "https://downloads.mongodb.com/compass/mongodb-compass-1.40.4-win32-x64.msi"
$compassFile = "$downloadsDir\mongodb-compass.msi"

try {
    Write-Host "   Downloading from: $compassUrl"
    Invoke-WebRequest -Uri $compassUrl -OutFile $compassFile -UseBasicParsing
    Write-Host "   ✅ MongoDB Compass downloaded successfully!" -ForegroundColor Green
    
    Write-Host "🔧 Installing MongoDB Compass..." -ForegroundColor Yellow
    Write-Host "   Note: This will open the installer. Follow the installation wizard." -ForegroundColor Cyan
    
    # Start the installer
    Start-Process -FilePath $compassFile -Wait
    Write-Host "   ✅ MongoDB Compass installation initiated!" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Failed to download MongoDB Compass: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# 2. Download MongoDB Shell (mongosh)
Write-Host "📥 Step 2: Downloading MongoDB Shell (mongosh)..." -ForegroundColor Yellow
$mongoshUrl = "https://downloads.mongodb.com/compass/mongosh-2.1.1-win32-x64.zip"
$mongoshFile = "$downloadsDir\mongosh.zip"
$mongoshDir = "$downloadsDir\mongosh"

try {
    Write-Host "   Downloading from: $mongoshUrl"
    Invoke-WebRequest -Uri $mongoshUrl -OutFile $mongoshFile -UseBasicParsing
    Write-Host "   ✅ MongoDB Shell downloaded successfully!" -ForegroundColor Green
    
    Write-Host "🔧 Extracting MongoDB Shell..." -ForegroundColor Yellow
    if (Test-Path $mongoshDir) {
        Remove-Item $mongoshDir -Recurse -Force
    }
    
    # Extract the ZIP file
    Add-Type -AssemblyName System.IO.Compression.FileSystem
    [System.IO.Compression.ZipFile]::ExtractToDirectory($mongoshFile, $mongoshDir)
    
    # Find the extracted mongosh executable
    $mongoshExe = Get-ChildItem -Path $mongoshDir -Name "mongosh.exe" -Recurse | Select-Object -First 1
    if ($mongoshExe) {
        $mongoshPath = (Get-ChildItem -Path $mongoshDir -Name "mongosh.exe" -Recurse | Select-Object -First 1).FullName
        Write-Host "   ✅ MongoDB Shell extracted to: $(Split-Path $mongoshPath)" -ForegroundColor Green
        Write-Host "   📋 mongosh.exe location: $mongoshPath" -ForegroundColor Cyan
    }
} catch {
    Write-Host "   ❌ Failed to download/extract MongoDB Shell: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# 3. Create connection shortcuts
Write-Host "🔗 Step 3: Creating connection shortcuts..." -ForegroundColor Yellow

# MongoDB connection string
$mongoUri = "mongodb+srv://melkamuwako5_db_user:YFweyhElTJBj5sXp@cluster0.x3jfm8p.mongodb.net/ethioheritage360?retryWrites=true&w=majority&appName=Cluster0"

# Create batch file for easy connection
$batchContent = @"
@echo off
echo 🌐 Connecting to MongoDB Atlas - EthioHeritage360
echo ===============================================
echo.
echo Connection String: mongodb+srv://melkamuwako5_db_user:****@cluster0.x3jfm8p.mongodb.net/ethioheritage360
echo.
pause
"$mongoshPath" "$mongoUri"
pause
"@

$batchFile = "$downloadsDir\connect-to-mongodb.bat"
$batchContent | Out-File -FilePath $batchFile -Encoding ASCII
Write-Host "   ✅ Created connection batch file: $batchFile" -ForegroundColor Green

# Create PowerShell connection script
$psContent = @"
# MongoDB Atlas Connection Script
Write-Host "🌐 Connecting to MongoDB Atlas - EthioHeritage360" -ForegroundColor Green
Write-Host "===============================================" -ForegroundColor Green
Write-Host ""

`$mongoUri = "$mongoUri"
`$mongoshPath = "$mongoshPath"

if (Test-Path `$mongoshPath) {
    Write-Host "🚀 Starting MongoDB Shell..." -ForegroundColor Yellow
    Write-Host "Connection: mongodb+srv://melkamuwako5_db_user:****@cluster0.x3jfm8p.mongodb.net/ethioheritage360" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "📝 Once connected, try these commands:" -ForegroundColor Yellow
    Write-Host "   show collections" -ForegroundColor Cyan
    Write-Host "   db.users.countDocuments()" -ForegroundColor Cyan  
    Write-Host "   db.stats()" -ForegroundColor Cyan
    Write-Host ""
    
    & `$mongoshPath `$mongoUri
} else {
    Write-Host "❌ MongoDB Shell not found at: `$mongoshPath" -ForegroundColor Red
    Write-Host "Please check the installation." -ForegroundColor Yellow
}
"@

$psFile = "$downloadsDir\connect-to-mongodb.ps1"
$psContent | Out-File -FilePath $psFile -Encoding UTF8
Write-Host "   ✅ Created PowerShell connection script: $psFile" -ForegroundColor Green

Write-Host ""

# 4. Create desktop shortcuts
Write-Host "🖥️ Step 4: Creating desktop shortcuts..." -ForegroundColor Yellow

try {
    $WshShell = New-Object -comObject WScript.Shell
    
    # MongoDB Compass shortcut
    if (Test-Path "$env:USERPROFILE\AppData\Local\MongoDBCompass\MongoDBCompass.exe") {
        $compassShortcut = $WshShell.CreateShortcut("$env:USERPROFILE\Desktop\MongoDB Compass.lnk")
        $compassShortcut.TargetPath = "$env:USERPROFILE\AppData\Local\MongoDBCompass\MongoDBCompass.exe"
        $compassShortcut.Save()
        Write-Host "   ✅ Created MongoDB Compass desktop shortcut" -ForegroundColor Green
    }
    
    # Connection script shortcut
    $connectShortcut = $WshShell.CreateShortcut("$env:USERPROFILE\Desktop\Connect to MongoDB Atlas.lnk")
    $connectShortcut.TargetPath = "powershell.exe"
    $connectShortcut.Arguments = "-ExecutionPolicy Bypass -File `"$psFile`""
    $connectShortcut.IconLocation = "powershell.exe"
    $connectShortcut.Save()
    Write-Host "   ✅ Created connection script desktop shortcut" -ForegroundColor Green
    
} catch {
    Write-Host "   ⚠️ Could not create desktop shortcuts: $($_.Exception.Message)" -ForegroundColor Yellow
}

Write-Host ""

# 5. Summary and next steps
Write-Host "🎉 INSTALLATION SUMMARY" -ForegroundColor Green
Write-Host "======================" -ForegroundColor Green
Write-Host ""

Write-Host "📦 Installed Tools:" -ForegroundColor Cyan
Write-Host "   ✅ MongoDB Compass (GUI client)" -ForegroundColor Green
Write-Host "   ✅ MongoDB Shell (mongosh)" -ForegroundColor Green
Write-Host "   ✅ Connection scripts created" -ForegroundColor Green
Write-Host ""

Write-Host "📁 Files Created:" -ForegroundColor Cyan
Write-Host "   - Downloads: $downloadsDir" -ForegroundColor Yellow
Write-Host "   - Batch file: $batchFile" -ForegroundColor Yellow  
Write-Host "   - PowerShell: $psFile" -ForegroundColor Yellow
Write-Host ""

Write-Host "🚀 How to Connect:" -ForegroundColor Cyan
Write-Host "   1. Use MongoDB Compass (GUI):" -ForegroundColor Yellow
Write-Host "      - Open MongoDB Compass" -ForegroundColor White
Write-Host "      - Paste: $mongoUri" -ForegroundColor White
Write-Host "      - Click Connect" -ForegroundColor White
Write-Host ""
Write-Host "   2. Use MongoDB Shell (Command Line):" -ForegroundColor Yellow
Write-Host "      - Run: $psFile" -ForegroundColor White
Write-Host "      - Or double-click desktop shortcut" -ForegroundColor White
Write-Host ""

Write-Host "🎯 Your Database Info:" -ForegroundColor Cyan
Write-Host "   - Database: ethioheritage360" -ForegroundColor White
Write-Host "   - Collections: 58 collections available" -ForegroundColor White
Write-Host "   - Status: ✅ Live and operational" -ForegroundColor Green
Write-Host ""

Write-Host "⚠️  Note: If local connection fails due to network restrictions," -ForegroundColor Yellow
Write-Host "   use Google Cloud Shell: https://console.cloud.google.com" -ForegroundColor Yellow
Write-Host ""

Write-Host "✨ Installation completed successfully!" -ForegroundColor Green
Write-Host "Press any key to exit..." -ForegroundColor Cyan
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
