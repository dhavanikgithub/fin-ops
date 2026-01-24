@echo off
setlocal

:: ========================================================
:: 1. REUSABLE VARIABLES (EDIT THESE)
:: ========================================================

:: Name of the Windows Service
set SERVICE_NAME=FinOpsNginx
echo [INFO] Service Name set to %SERVICE_NAME%

:: Display Name (Shows in Task Manager)
set DISPLAY_NAME="FinOps Nginx Proxy"
echo [INFO] Display Name set to %DISPLAY_NAME%

:: The full path to your project directory
set PROJECT_DIR=%~dp0
echo [INFO] Project Directory set to %PROJECT_DIR%


:: Path to the fol1der containing nssm.exe (Leave blank if in same folder)
set NSSM_PATH=%PROJECT_DIR%nssm-2.24\win64
echo [INFO] NSSM Directory set to %NSSM_PATH%

set NSSM_EXE=%NSSM_PATH%\nssm.exe
echo [INFO] NSSM Executable Path set to %NSSM_EXE%

:: Path to your Nginx EXECUTABLE
set NGINX_EXE=%PROJECT_DIR%nginx-1.28.1\nginx.exe
echo [INFO] Nginx Executable Path set to %NGINX_EXE%

:: Path to your Nginx ROOT FOLDER (Crucial for finding conf/nginx.conf)
set NGINX_ROOT=%PROJECT_DIR%nginx-1.28.1
echo [INFO] Nginx Root Directory set to %NGINX_ROOT%

:: ========================================================
:: 2. ADMIN CHECK
:: ========================================================
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo [ERROR] Admin privileges required.
    echo Right-click this file and select "Run as Administrator".
    pause
    exit /b
)

:: ========================================================
:: 3. INSTALLATION LOGIC
:: ========================================================
echo [INFO] Installing %SERVICE_NAME%...

:: Check if NSSM exists
if not exist %NSSM_EXE% (
    echo [ERROR] nssm.exe not found in "%NSSM_PATH%". 
    echo Please make sure nssm.exe is next to this script or update NSSM_PATH.
    pause
    exit /b
)

:: Install Service
%NSSM_EXE% install "%SERVICE_NAME%" "%NGINX_EXE%"
echo [INFO] Nginx Executable set to %NGINX_EXE%

:: Set the "Start in" directory (CRITICAL for Nginx to find config files)
%NSSM_EXE% set "%SERVICE_NAME%" AppDirectory "%NGINX_ROOT%"
echo [INFO] App Directory set to %NGINX_ROOT%

:: Set Description and Display Name
%NSSM_EXE% set "%SERVICE_NAME%" DisplayName "%DISPLAY_NAME%"
echo [INFO] Display Name set to %DISPLAY_NAME%
echo [INFO] Setting service description...
%NSSM_EXE% set "%SERVICE_NAME%" Description "Nginx Reverse Proxy for FinOps App on Port 3000"

:: D. Setup Logging (Highly recommended for debugging services)
echo [INFO] Setting up logging...
if not exist "%PROJECT_DIR%logs" (
    mkdir "%PROJECT_DIR%logs"
)
echo [INFO] Logs will be stored in %PROJECT_DIR%logs

:: Set Log Files (Helpful for debugging)
echo [INFO] Configuring log files...

echo [INFO] Standard output log set to %PROJECT_DIR%logs\nginx-service.log
%NSSM_EXE% set "%SERVICE_NAME%" AppStdout "%PROJECT_DIR%logs\nginx-service.log"
echo [INFO] Standard error log set to %PROJECT_DIR%logs\nginx-error.log
%NSSM_EXE% set "%SERVICE_NAME%" AppStderr "%PROJECT_DIR%logs\nginx-error.log"

:: Start the Service
echo [INFO] Starting %SERVICE_NAME%...
%NSSM_EXE% start "%SERVICE_NAME%"

echo.
echo [SUCCESS] Service installed and started successfully!
pause