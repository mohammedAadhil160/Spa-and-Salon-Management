@echo off
title LuxeSpa Saloon - Full Stack Launch
color 0A
echo.
echo  ============================================================
echo   LuxeSpa Saloon ^& Spa Management System
echo   Starting Full Application...
echo  ============================================================
echo.

:: Check Java
java -version >nul 2>&1
if %errorlevel% neq 0 (
    echo  [ERROR] Java is not installed or not in PATH.
    echo  Please install Java 17 from: https://adoptium.net/
    pause
    exit /b 1
)

:: Check Maven
mvn -version >nul 2>&1
if %errorlevel% neq 0 (
    echo  [WARNING] Maven not found in PATH. Trying mvnw wrapper...
    set MVN_CMD=mvnw
) else (
    set MVN_CMD=mvn
)

echo  [1/3] Starting Java Spring Boot Backend...
echo        Running on: http://localhost:8080
echo.
start "LuxeSpa Backend" cmd /k "cd /d %~dp0backend && %MVN_CMD% spring-boot:run"

:: Wait for backend to start
echo  [2/3] Waiting for backend to initialize (15 seconds)...
timeout /t 15 /nobreak >nul

:: Open frontend in default browser
echo  [3/3] Launching Frontend in your browser...
echo        Opening: %~dp0frontend\index.html
echo.
start "" "%~dp0frontend\index.html"

echo  ============================================================
echo   LuxeSpa is running!
echo.
echo   Frontend: file://%~dp0frontend\index.html
echo   Backend:  http://localhost:8080
echo   H2 DB:    http://localhost:8080/h2-console
echo  ============================================================
echo.
echo  Press any key to exit this launcher window...
pause >nul
