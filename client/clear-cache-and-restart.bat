@echo off
echo Clearing browser cache and restarting frontend...

REM Clear Vite cache
if exist node_modules\.vite rmdir /s /q node_modules\.vite

REM Clear browser cache (this is a reminder for manual action)
echo Please clear your browser cache manually:
echo 1. Press Ctrl+Shift+R for hard refresh
echo 2. Or open Developer Tools and right-click refresh button
echo 3. Select "Empty Cache and Hard Reload"

REM Restart the development server
echo Starting frontend development server...
npm run dev

pause
