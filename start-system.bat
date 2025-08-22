@echo off
echo ============================================
echo   EthioHeritage360 - Complete System Startup
echo ============================================
echo.

echo Checking MongoDB status...
sc query MongoDB | find "RUNNING" >nul
if %errorlevel%==0 (
    echo ✓ MongoDB is running
) else (
    echo ! MongoDB is not running. Starting MongoDB...
    net start MongoDB
)

echo.
echo Starting Backend Server...
echo.
cd server
start "EthioHeritage360 Backend" cmd /c "echo Starting Backend Server... && node server.js && pause"

timeout /t 3 /nobreak >nul

echo.
echo Starting Frontend Client...
echo.
cd ../client
start "EthioHeritage360 Frontend" cmd /c "echo Starting Frontend Client... && npm run dev && pause"

echo.
echo ============================================
echo   System Started Successfully!
echo ============================================
echo.
echo Backend: http://localhost:5000
echo Frontend: http://localhost:5173
echo Health Check: http://localhost:5000/api/health
echo.
echo Press any key to continue...
pause >nul
