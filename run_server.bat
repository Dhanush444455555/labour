@echo off
title Labour App Server
cd /d "%~dp0"

echo =========================================
echo Starting Labour App Server Setup...
echo =========================================

echo.
echo Installing dependencies if missing...
if not exist "node_modules\" (
  echo Root node_modules not found, running npm install...
  call npm install
)
if not exist "backend\node_modules\" (
  echo Backend node_modules not found, running npm install...
  call npm install --prefix backend
)
if not exist "frontend\node_modules\" (
  echo Frontend node_modules not found, running npm install...
  call npm install --prefix frontend
)

echo.
echo =========================================
echo All dependencies installed.
echo Starting backend and frontend servers...
echo =========================================
echo.

:: Start frontend in browser after a short delay to ensure Vite is up
start cmd /c "timeout /t 3 >nul && start http://localhost:5173"

:: Start the servers concurrently
call npm run dev

pause
