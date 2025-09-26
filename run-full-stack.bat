@echo off
title EthioHeritage360 Full Stack Development

echo ========================================
echo   EthioHeritage360 Full Stack Startup
echo ========================================
echo.

echo 🚀 Starting Backend Server...
echo.
start "Backend Server (Port 5000)" cmd /k "cd /d %~dp0\server && npm start"

echo ⏳ Waiting 5 seconds for backend to initialize...
timeout /t 5 /nobreak > nul

echo 🌐 Starting Frontend Server...
echo.
start "Frontend Server (Port 5173)" cmd /k "cd /d %~dp0\client && npm run dev"

echo.
echo ✅ Both servers are starting!
echo.
echo 🔗 Backend: http://localhost:5000
echo 🔗 Frontend: http://localhost:5173
echo 🔗 API Health: http://localhost:5000/api/health
echo.
echo 📝 Backend features available:
echo    - User Authentication (/api/auth)
echo    - Booking System (/api/bookings)
echo    - Rental System (/api/rentals)
echo    - Admin Panel (/api/admin)
echo    - Super Admin (/api/super-admin)
echo.
echo 💡 Press any key to open both URLs in browser...
pause > nul

start http://localhost:5000/api/health
start http://localhost:5173

echo.
echo 🎉 Full stack application is running!
echo 📝 Check both terminal windows for logs
echo.
pause
