@echo off
cd /d "%~dp0backend"
echo Starting Hospital Management System backend...
mvn clean compile
if errorlevel 1 pause & exit /b 1
mvn spring-boot:run
pause
