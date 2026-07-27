@echo off
title Developer Workspace Manager - CareerEngine / Vishleshan

:: Ensure standard system paths are in the environment PATH
set PATH=%SystemRoot%\system32;%SystemRoot%;%SystemRoot%\System32\Wbem;C:\Program Files\nodejs;C:\Program Files\Redis;%PATH%

:: Always switch to the directory where this script is located
cd /d "%~dp0"

echo ===================================================
echo [1/6] Stopping existing processes on ports 5173 and 8000...
echo ===================================================

:: Stop any process on 5173 (Vite Frontend)
for /f "tokens=5" %%a in ('netstat -aon ^| findstr /r /c:":5173 " ^| findstr LISTENING 2^>nul') do (
    echo Killing process %%a on port 5173
    taskkill /f /pid %%a 2>nul
)

:: Stop any process on 8000 (Django Backend)
for /f "tokens=5" %%a in ('netstat -aon ^| findstr /r /c:":8000 " ^| findstr LISTENING 2^>nul') do (
    echo Killing process %%a on port 8000
    taskkill /f /pid %%a 2>nul
)

echo.
echo ===================================================
echo [2/6] Checking Redis status on port 6379...
echo ===================================================
netstat -ano | findstr /r /c:":6379 " | findstr LISTENING >nul
if %errorlevel% equ 0 (
    echo Redis is already running on port 6379.
) else (
    echo Redis is NOT running. Attempting to start redis-server...
    if exist "C:\Program Files\Redis\redis-server.exe" (
        echo Found Redis in C:\Program Files\Redis. Starting...
        start "Redis Server" /d "C:\Program Files\Redis" cmd /k redis-server.exe
    ) else (
        where redis-server >nul 2>nul
        if %errorlevel% equ 0 (
            start "Redis Server" cmd /k "redis-server"
        ) else (
            echo WARNING: 'redis-server' not found. Please start Redis manually if required.
        )
    )
)

echo.
echo ===================================================
echo [3/6] Verifying Database and Running Migrations...
echo ===================================================
cd /d "%~dp0backend"
if not exist "venv\Scripts\python.exe" (
    echo Virtual environment 'venv' not found in backend/ directory.
    echo Creating virtual environment...
    python -m venv venv
    if %errorlevel% neq 0 (
        echo ERROR: Failed to create virtual environment. Please install python.
        pause
        exit /b 1
    )
    echo Installing dependencies from requirements.txt...
    "%~dp0backend\venv\Scripts\python.exe" -m pip install -r requirements.txt
)

echo Running database migrations...
"%~dp0backend\venv\Scripts\python.exe" manage.py migrate
if %errorlevel% neq 0 (
    echo.
    echo WARNING: Database migrations failed!
    echo Please make sure PostgreSQL is running and credentials in backend/.env are correct.
    echo.
    echo Press any key to continue launching services anyway...
    pause >nul
)

echo.
echo ===================================================
echo [4/6] Starting Django Backend on port 8000...
echo ===================================================
start "Django Backend (Port 8000)" /d "%~dp0backend" cmd /k ""%~dp0backend\venv\Scripts\python.exe" manage.py runserver 0.0.0.0:8000"

echo.
echo ===================================================
echo [5/6] Starting Vite Frontend on port 5173...
echo ===================================================
cd /d "%~dp0frontend"
if not exist "node_modules" (
    echo Frontend dependencies 'node_modules' not found. Installing...
    call npm.cmd install
)
start "Vite Frontend (Port 5173)" /d "%~dp0frontend" cmd /k "npm.cmd run dev"

echo.
echo ===================================================
echo [6/6] Starting Celery Worker...
echo ===================================================
start "Celery Worker" /d "%~dp0backend" cmd /k ""%~dp0backend\venv\Scripts\python.exe" -m celery -A workers.celery_worker worker --loglevel=info --pool=threads --concurrency=4"

echo.
echo ===================================================
echo Launching default web browser...
echo ===================================================
echo Waiting 5 seconds for services to initialize...
ping 127.0.0.1 -n 6 >nul
start http://localhost:5173

cd /d "%~dp0"
echo.
echo ===================================================
echo All services launched!
echo - Frontend: http://localhost:5173
echo - Backend: http://127.0.0.1:8000
echo ===================================================
