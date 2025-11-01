@echo off
REM ======================================================
REM  MANAGE WINDOWS SERVICES FOR CLIENT (Next.js) AND BACKEND (Express)
REM  Start, Stop, or Restart services
REM ======================================================

REM ---- Configuration Section ----
set CLIENT_SERVICE_NAME=finops-client-server
set BACKEND_SERVICE_NAME=finops-backend-server

echo.
echo ==============================================
echo Service Management for FinOps Node.js servers
echo ==============================================
echo.
echo Choose an action:
echo 1. Start services
echo 2. Stop services
echo 3. Restart services
echo 4. Check service status
echo 5. Exit
echo.
set /p choice="Enter your choice (1-5): "

if "%choice%"=="1" goto start_services
if "%choice%"=="2" goto stop_services
if "%choice%"=="3" goto restart_services
if "%choice%"=="4" goto check_status
if "%choice%"=="5" goto exit
echo Invalid choice. Please try again.
pause
goto :eof

:start_services
echo.
echo Starting services...
net start %BACKEND_SERVICE_NAME%
net start %CLIENT_SERVICE_NAME%
echo.
echo Services start command completed.
pause
goto :eof

:stop_services
echo.
echo Stopping services...
net stop %CLIENT_SERVICE_NAME%
net stop %BACKEND_SERVICE_NAME%
echo.
echo Services stop command completed.
pause
goto :eof

:restart_services
echo.
echo Restarting services...
echo Stopping services first...
net stop %CLIENT_SERVICE_NAME%
net stop %BACKEND_SERVICE_NAME%
echo.
echo Starting services...
net start %BACKEND_SERVICE_NAME%
net start %CLIENT_SERVICE_NAME%
echo.
echo Services restart completed.
pause
goto :eof

:check_status
echo.
echo Checking service status...
echo.
echo Backend Service Status:
sc query %BACKEND_SERVICE_NAME%
echo.
echo Client Service Status:
sc query %CLIENT_SERVICE_NAME%
echo.
pause
goto :eof

:exit
echo Goodbye!