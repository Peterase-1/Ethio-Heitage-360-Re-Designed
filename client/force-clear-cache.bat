@echo off
echo 🚨 EMERGENCY CACHE CLEAR - FORCE PORT 5000 FIX
echo.

echo Clearing all caches...
if exist node_modules\.vite rmdir /s /q node_modules\.vite
if exist .vite rmdir /s /q .vite
if exist dist rmdir /s /q dist

echo.
echo 🧹 Cache cleared! Now restarting frontend...
echo.
echo IMPORTANT: After the frontend starts:
echo 1. Open Developer Tools (F12)
echo 2. Go to Console tab
echo 3. Look for "🚀 API Client initialized with base URL: http://localhost:5000"
echo 4. If you see port 5001, clear browser cache and refresh
echo.

npm run dev
