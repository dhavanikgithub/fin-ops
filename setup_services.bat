@echo off
REM ======================================================
REM  SETUP WINDOWS SERVICES FOR CLIENT (Next.js) AND BACKEND (Express)
REM  Requires NSSM (https://nssm.cc/download)
REM ======================================================

REM ---- Configuration Section ----
set CLIENT_SERVICE_NAME=finops-client-server
set BACKEND_SERVICE_NAME=finops-backend-server

REM ---- Paths to Node and App ----
set NODE_PATH="C:\Program Files\nodejs\node.exe"

REM ---- Adjust these paths ----
set CLIENT_DIR=%~dp0client
set BACKEND_DIR=%~dp0server

REM ---- Commands to start servers ----
set CLIENT_CMD=npm run production
set BACKEND_CMD=npm run production

REM ---- NSSM Path ----
set NSSM_PATH=%~dp0nssm-2.24\win64\nssm.exe

echo.
echo ==============================================
echo Creating Windows services for Node.js servers
echo ==============================================

REM ---- Create log directories if they don't exist ----
echo Creating log directories...
if not exist "%BACKEND_DIR%\logs" mkdir "%BACKEND_DIR%\logs"
if not exist "%CLIENT_DIR%\logs" mkdir "%CLIENT_DIR%\logs"

REM ---- Backend Service ----
echo Creating %BACKEND_SERVICE_NAME% service...
%NSSM_PATH% install %BACKEND_SERVICE_NAME% cmd
%NSSM_PATH% set %BACKEND_SERVICE_NAME% AppParameters "/c npm run production"
%NSSM_PATH% set %BACKEND_SERVICE_NAME% AppDirectory %BACKEND_DIR%
%NSSM_PATH% set %BACKEND_SERVICE_NAME% DisplayName "FinOps Express Backend Server"
%NSSM_PATH% set %BACKEND_SERVICE_NAME% Description "FinOps Backend API Server running on Node.js"
%NSSM_PATH% set %BACKEND_SERVICE_NAME% Start SERVICE_AUTO_START
%NSSM_PATH% set %BACKEND_SERVICE_NAME% AppStopMethodSkip 0
%NSSM_PATH% set %BACKEND_SERVICE_NAME% AppStopMethodConsole 1500
%NSSM_PATH% set %BACKEND_SERVICE_NAME% AppStopMethodWindow 1500
%NSSM_PATH% set %BACKEND_SERVICE_NAME% AppStopMethodThreads 1500
%NSSM_PATH% set %BACKEND_SERVICE_NAME% AppThrottle 1500
%NSSM_PATH% set %BACKEND_SERVICE_NAME% AppStdout %BACKEND_DIR%\logs\backend_out.log
%NSSM_PATH% set %BACKEND_SERVICE_NAME% AppStderr %BACKEND_DIR%\logs\backend_err.log
%NSSM_PATH% set %BACKEND_SERVICE_NAME% AppStdoutCreationDisposition 4
%NSSM_PATH% set %BACKEND_SERVICE_NAME% AppStderrCreationDisposition 4

REM ---- Client Service ----
echo Creating %CLIENT_SERVICE_NAME% service...
%NSSM_PATH% install %CLIENT_SERVICE_NAME% cmd
%NSSM_PATH% set %CLIENT_SERVICE_NAME% AppParameters "/c npm run production"
%NSSM_PATH% set %CLIENT_SERVICE_NAME% AppDirectory %CLIENT_DIR%
%NSSM_PATH% set %CLIENT_SERVICE_NAME% DisplayName "FinOps Next.js Client Server"
%NSSM_PATH% set %CLIENT_SERVICE_NAME% Description "FinOps Frontend Client running on Next.js"
%NSSM_PATH% set %CLIENT_SERVICE_NAME% Start SERVICE_AUTO_START
%NSSM_PATH% set %CLIENT_SERVICE_NAME% AppStopMethodSkip 0
%NSSM_PATH% set %CLIENT_SERVICE_NAME% AppStopMethodConsole 1500
%NSSM_PATH% set %CLIENT_SERVICE_NAME% AppStopMethodWindow 1500
%NSSM_PATH% set %CLIENT_SERVICE_NAME% AppStopMethodThreads 1500
%NSSM_PATH% set %CLIENT_SERVICE_NAME% AppThrottle 1500
%NSSM_PATH% set %CLIENT_SERVICE_NAME% AppStdout %CLIENT_DIR%\logs\client_out.log
%NSSM_PATH% set %CLIENT_SERVICE_NAME% AppStderr %CLIENT_DIR%\logs\client_err.log
%NSSM_PATH% set %CLIENT_SERVICE_NAME% AppStdoutCreationDisposition 4
%NSSM_PATH% set %CLIENT_SERVICE_NAME% AppStderrCreationDisposition 4

echo.
echo Starting both services...
net start %BACKEND_SERVICE_NAME%
net start %CLIENT_SERVICE_NAME%

echo.
echo Services created and started successfully!
echo To verify, open: services.msc
pause
