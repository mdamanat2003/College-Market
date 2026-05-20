@echo off
echo =========================================
echo    STARTING CAMPUSCART MICROSERVICES
echo =========================================

echo 1. Starting Backend Server...
start cmd /k "cd backend && npm run dev"

echo 2. Starting Landing Page (Web)...
start cmd /k "cd campuscart-web && npm run dev"

echo 3. Starting Mobile App (Expo)...
start cmd /k "cd frontend && npx expo start"

echo.
echo All servers are starting in separate windows!
echo You can minimize these windows while working.