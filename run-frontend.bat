@echo off
cd /d "%~dp0frontend"
if not exist node_modules (
  echo Installing frontend dependencies...
  npm install
  if errorlevel 1 pause & exit /b 1
)
npm run dev
pause
