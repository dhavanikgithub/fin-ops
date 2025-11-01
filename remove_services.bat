@echo off
REM ======================================================
REM  REMOVE WINDOWS SERVICES FOR CLIENT (Next.js) AND BACKEND (Express)
REM  Requires NSSM (https://nssm.cc/download)
REM ======================================================

REM ---- Configuration Section ----
set CLIENT_SERVICE_NAME=finops-client-server
set BACKEND_SERVICE_NAME=finops-backend-server

REM ---- NSSM Path ----
set NSSM_PATH=%~dp0nssm-2.24\win64\nssm.exe

echo.
echo ==============================================
echo Removing Windows services for Node.js servers
echo ==============================================

REM ---- Stop Services First ----
echo Stopping services...
net stop %BACKEND_SERVICE_NAME% 2>nul
if %errorlevel% equ 0 (
    echo %BACKEND_SERVICE_NAME% stopped successfully.
) else (
    echo %BACKEND_SERVICE_NAME% was not running or does not exist.
)

net stop %CLIENT_SERVICE_NAME% 2>nul
if %errorlevel% equ 0 (
    echo %CLIENT_SERVICE_NAME% stopped successfully.
) else (
    echo %CLIENT_SERVICE_NAME% was not running or does not exist.
)

echo.
echo Removing services...

REM ---- Remove Backend Service ----
echo Removing %BACKEND_SERVICE_NAME% service...
%NSSM_PATH% remove %BACKEND_SERVICE_NAME% confirm
if %errorlevel% equ 0 (
    echo %BACKEND_SERVICE_NAME% removed successfully.
) else (
    echo Failed to remove %BACKEND_SERVICE_NAME% or service does not exist.
)

REM ---- Remove Client Service ----
echo Removing %CLIENT_SERVICE_NAME% service...
%NSSM_PATH% remove %CLIENT_SERVICE_NAME% confirm
if %errorlevel% equ 0 (
    echo %CLIENT_SERVICE_NAME% removed successfully.
) else (
    echo Failed to remove %CLIENT_SERVICE_NAME% or service does not exist.
)

echo.
echo Service removal completed!
echo To verify removal, open: services.msc
pause