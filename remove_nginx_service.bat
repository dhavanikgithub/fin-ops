@echo off
setlocal

:: ========================================================
:: 1. REUSABLE VARIABLES (EDIT THESE)
:: ========================================================
:: MUST match the name used in the install script
set SERVICE_NAME=FinOpsNginx

:: The full path to your project directory
set PROJECT_DIR=%~dp0
echo [INFO] Project Directory set to %PROJECT_DIR%

:: Path to the fol1der containing nssm.exe (Leave blank if in same folder)
set NSSM_PATH=%PROJECT_DIR%nssm-2.24\win64

set NSSM_EXE=%NSSM_PATH%\nssm.exe

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
:: 3. REMOVAL LOGIC
:: ========================================================
echo [INFO] Stopping and removing service: %SERVICE_NAME%...

:: Check if NSSM exists
if not exist %NSSM_EXE% (
    echo [ERROR] nssm.exe not found. Cannot proceed.
    pause
    exit /b
)

:: Check if service exists (by trying to get its status)
sc query "%SERVICE_NAME%" >nul 2>&1
if %errorLevel% neq 0 (
    echo [WARNING] Service "%SERVICE_NAME%" does not exist or is already removed.
    pause
    exit /b
)

:: Stop the service
%NSSM_EXE% stop "%SERVICE_NAME%"

:: Remove the service (confirm suppresses the "Are you sure?" popup)
%NSSM_EXE% remove "%SERVICE_NAME%" confirm

echo.
echo [SUCCESS] Service %SERVICE_NAME% has been removed.
pause