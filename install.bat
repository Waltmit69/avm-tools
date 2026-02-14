@echo off
setlocal EnableDelayedExpansion

title AVM INSTALLER - INSTALLATION SCRIPT

for /F "tokens=1,2 delims=#" %%a in ('"prompt #$H#$E# & echo on & for %%b in (1) do rem"') do set "ESC=%%b"

set "C_RESET=%ESC%[0m"
set "C_BOLD=%ESC%[1m"
set "C_CYAN=%ESC%[36m"
set "C_BLUE=%ESC%[34m"
set "C_GREEN=%ESC%[32m"
set "C_RED=%ESC%[31m"
set "C_YELLOW=%ESC%[33m"
set "C_GRAY=%ESC%[90m"
set "C_WHITE=%ESC%[97m"

set "COL1=%ESC%[1G"
set "ERASE=%ESC%[K"

cd /d "%~dp0"

openfiles >nul 2>&1
if %errorlevel% neq 0 goto :NEED_ADMIN

set "NODE_REQ=v22.11.0"
set "NODE_URL=https://nodejs.org/dist/v22.11.0/node-v22.11.0-x64.msi"
set "NODE_INSTALLER=%TEMP%\node-setup.msi"



set "NODE_GOOD=0"


:INIT
cls
echo.
echo           %C_WHITE%%C_BOLD%AVM INSTALLER - SYSTEM SETUP v2.16%C_RESET%
echo.
echo  %C_GRAY%------------------------------------------------------------%C_RESET%
echo  [%C_BLUE%i%C_RESET%] Checking system environment...

node -v >nul 2>&1
if %errorlevel% neq 0 goto :NODE_NOT_INSTALLED
for /f %%i in ('node -v') do set "CURRENT_NODE=%%i"
for /f "tokens=1 delims=v." %%a in ("!CURRENT_NODE!") do set "NODE_MAJOR=%%a"
if !NODE_MAJOR! equ 22 (
    set "NODE_GOOD=1"
    set "NODE_STATUS=%C_GREEN%OK [!CURRENT_NODE!]%C_RESET%"
) else (
    set "NODE_STATUS=%C_YELLOW%VERSION MISMATCH [!CURRENT_NODE!]%C_RESET%"
)
goto :DISPLAY_STATUS

:NODE_NOT_INSTALLED
set "NODE_STATUS=%C_RED%NOT INSTALLED%C_RESET%"



:DISPLAY_STATUS
echo   %C_GRAY%------------------------------------------------------------%C_RESET%
echo   %C_BOLD%COMPONENT      REQUIRED        CURRENT STATUS%C_RESET%
echo   %C_BLUE%-------------  --------------  -----------------------------%C_RESET%
echo   Node.js        %NODE_REQ%        !NODE_STATUS!

echo   %C_BLUE%-------------  --------------  -----------------------------%C_RESET%
echo.

if "!NODE_GOOD!"=="1" goto :INSTALL_PROJECT

echo  [%C_YELLOW%*%C_RESET%] %C_BOLD%ACTION REQUIRED:%C_RESET% Environment components need optimization.
set /p "USER_CONSENT=   %C_BOLD%Proceed with automatic fix? (Y/N):%C_RESET% "
if /i not "!USER_CONSENT!"=="Y" goto :ABORT_REPAIR

:REPAIR_START
cls
echo.
echo  %C_BOLD%STEP 1: Cleaning Environment%C_RESET%
echo  %C_GRAY%------------------------------------------------------------%C_RESET%

echo  [%C_BLUE%i%C_RESET%] Closing active Node.js processes...
taskkill /F /IM node.exe >nul 2>&1

echo  [%C_BLUE%i%C_RESET%] Uninstalling existing Node.js packages...
powershell -Command "$ProgressPreference = 'SilentlyContinue'; Get-Package -Name 'Node.js*' -ErrorAction SilentlyContinue | Uninstall-Package -Force -ErrorAction SilentlyContinue" >nul 2>&1
wmic product where "Name like 'Node.js%%'" call uninstall /nointeractive >nul 2>&1

echo  [%C_BLUE%i%C_RESET%] Removing residue folders...
if exist "%ProgramFiles%\nodejs" (
    timeout /t 2 >nul
    rmdir /s /q "%ProgramFiles%\nodejs" >nul 2>&1
)
if exist "%AppData%\npm" rmdir /s /q "%AppData%\npm" >nul 2>&1
if exist "%AppData%\npm-cache" rmdir /s /q "%AppData%\npm-cache" >nul 2>&1
if exist "%LocalAppData%\Temp\node-v*" del /q /f "%LocalAppData%\Temp\node-v*" >nul 2>&1

echo  [%C_GREEN%V%C_RESET%] Cleanup complete.

echo.
echo  %C_BOLD%STEP 2: Fresh Installation%C_RESET%
echo  %C_GRAY%------------------------------------------------------------%C_RESET%

echo  [%C_BLUE%i%C_RESET%] Downloading stable Node.js %NODE_REQ%...
powershell -Command "$ProgressPreference = 'SilentlyContinue'; Invoke-WebRequest -Uri '%NODE_URL%' -OutFile '%NODE_INSTALLER%'"

if not exist "%NODE_INSTALLER%" (
    echo  [%C_RED%X%C_RESET%] %C_BOLD%ERROR:%C_RESET% Download failed.
    pause
    exit /b
)

set "F=##############################"
set "E=------------------------------"
for /L %%i in (1,1,30) do (
    set /a "p=%%i*100/30"
    <nul set /p "=%COL1%%ERASE% [%C_BLUE%i%C_RESET%] %C_WHITE%Loading: %C_BLUE%[%C_WHITE%!F:~0,%%i!%C_GRAY%!E:~%%i!%C_BLUE%] %C_WHITE%!p!%%!C_RESET!"
    timeout /t 0 >nul 2>&1
)
echo.

echo  [%C_YELLOW%*%C_RESET%] Installing Node.js (Please wait)...
start /wait "" msiexec /i "%NODE_INSTALLER%" /qn /norestart
set "INST_ERR=%errorlevel%"

if %INST_ERR% equ 0 goto :INSTALL_SUCCESS
if %INST_ERR% equ 3010 goto :INSTALL_SUCCESS

:INSTALL_FAILED
echo  [%C_RED%X%C_RESET%] Automatic installation failed (Error: %INST_ERR%).
echo  [%C_BLUE%i%C_RESET%] Opening manual installer...
start "" "%NODE_INSTALLER%"
echo  [%C_YELLOW%*%C_RESET%] Please complete the installation manually.
pause
goto :REPAIR_DONE

:INSTALL_SUCCESS
echo  [%C_GREEN%V%C_RESET%] Node.js installation successful.

:REPAIR_DONE
echo.
echo  %C_CYAN%============================================================%C_RESET%
echo   [%C_GREEN%V%C_RESET%] %C_BOLD%ENVIRONMENT READY%C_RESET%
echo  %C_CYAN%============================================================%C_RESET%
echo.
echo  [%C_BLUE%i%C_RESET%] Updating system path and starting initialization...
set "PATH=%PATH%;%ProgramFiles%\nodejs"
timeout /t 2 >nul
goto :INSTALL_PROJECT

:INSTALL_PROJECT
echo.
echo  %C_BOLD%STEP 3: Initializing Project%C_RESET%
echo  %C_GRAY%------------------------------------------------------------%C_RESET%

set "CUR=%~dp0"

if exist "%CUR%stub" (
    echo  [%C_BLUE%i%C_RESET%] Initializing Stub components...
    cd /d "%CUR%stub"
    call npm install --loglevel=error
)

if exist "%CUR%gui" (
    echo  [%C_BLUE%i%C_RESET%] Initializing GUI components...
    cd /d "%CUR%gui"
    call npm install --loglevel=error
)

if exist "%CUR%build" (
    echo  [%C_BLUE%i%C_RESET%] Initializing Build Engine...
    cd /d "%CUR%build"
    call npm install --loglevel=error
)

echo.
echo  %C_GREEN%-----------------------------------------------------------------------%C_RESET%
echo   [%C_GREEN%V%C_RESET%] %C_BOLD%AVM STEALER - INSTALLATION COMPLETE, YOU CAN NOW LAUNCH START.BAT%C_RESET%
echo  %C_GREEN%-----------------------------------------------------------------------%C_RESET%
pause
exit /b

:NEED_ADMIN
echo.
echo  [%C_RED%X%C_RESET%] %C_BOLD%ERROR:%C_RESET% %C_RED%Administrator privileges required.%C_RESET%
echo.
pause
exit /b

:ABORT_REPAIR
goto :INSTALL_PROJECT
