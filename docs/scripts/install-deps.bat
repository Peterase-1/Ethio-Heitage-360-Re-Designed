@echo off
echo Installing client dependencies...
cd client
call npm install react-leaflet leaflet

echo Installing server dependencies...
cd ../server
call npm install

echo Done! You can now run both client and server with real map functionality.
pause
