@echo off
echo Starting EthioHeritage360 Backend Server...
cd backend
set MONGODB_URI=mongodb+srv://melkamuwako5_db_user:YFweyhElTJBj5sXp@cluster0.x3jfm8p.mongodb.net/ethioheritage360?retryWrites=true&w=majority&appName=Cluster0
set JWT_SECRET=19d698dd6851137fa013915a78e87a7a975c7822e6fdda30be004ebf711a07a6
set PORT=5001
set NODE_ENV=development
echo Environment variables set
echo Starting server on port 5001...
node server.js
