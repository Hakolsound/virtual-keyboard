@echo off
setlocal EnableDelayedExpansion
echo ============================================================
echo  Virtual Keyboard - First-time Setup
echo  Run as Administrator
echo ============================================================
echo.

:: ── Check admin ──────────────────────────────────────────────
net session >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
  echo ERROR: Please right-click setup.bat and choose "Run as administrator".
  pause & exit /b 1
)

:: ── Detect repo root (script lives in repo root) ─────────────
set "REPO=%~dp0"
if "%REPO:~-1%"=="\" set "REPO=%REPO:~0,-1%"
set "DIST=%REPO%\dist"
set "URL_FILE=%REPO%\kiosk-url.txt"

:: ── Node.js ───────────────────────────────────────────────────
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
  echo Node.js not found. Installing via winget...
  winget install --id OpenJS.NodeJS.LTS -e --accept-source-agreements --accept-package-agreements
  if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Could not install Node.js. Install manually from https://nodejs.org then re-run.
    pause & exit /b 1
  )
  echo Refreshing PATH...
  call refreshenv >nul 2>&1
)
echo [OK] Node.js: & node -v

:: ── Git ───────────────────────────────────────────────────────
where git >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
  echo Git not found. Installing via winget...
  winget install --id Git.Git -e --accept-source-agreements --accept-package-agreements
  if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Could not install Git. Install manually from https://git-scm.com then re-run.
    pause & exit /b 1
  )
  call refreshenv >nul 2>&1
)
echo [OK] Git: & git --version

:: ── npm install + build ───────────────────────────────────────
echo.
echo Installing dependencies...
call npm install
if %ERRORLEVEL% NEQ 0 ( echo ERROR: npm install failed. & pause & exit /b 1 )

echo Building extension...
call npm run build
if %ERRORLEVEL% NEQ 0 ( echo ERROR: build failed. & pause & exit /b 1 )
echo [OK] Extension built to: %DIST%

:: ── Suppress Windows touch keyboard ──────────────────────────
echo.
echo Suppressing Windows touch keyboard...
reg add "HKLM\SOFTWARE\Policies\Microsoft\TabletPC" /v PreventLaunchingTouchKeyboard /t REG_DWORD /d 1 /f >nul
reg add "HKLM\SOFTWARE\Microsoft\TabletTip\1.7"    /v DisableNewKeyboardExperience  /t REG_DWORD /d 1 /f >nul
taskkill /F /IM TabTip.exe >nul 2>&1
echo [OK] Windows touch keyboard suppressed.

:: ── Kiosk URL ─────────────────────────────────────────────────
echo.
set "KIOSK_URL="
if exist "%URL_FILE%" (
  set /p KIOSK_URL=<"%URL_FILE%"
  echo Current kiosk URL: !KIOSK_URL!
  set /p CHANGE_URL=Change URL? (y/N):
  if /i "!CHANGE_URL!"=="y" set "KIOSK_URL="
)
if "!KIOSK_URL!"=="" (
  set /p KIOSK_URL=Enter kiosk URL (e.g. https://your-app.com):
  echo !KIOSK_URL!>"%URL_FILE%"
)
echo [OK] Kiosk URL: !KIOSK_URL!

:: ── Desktop shortcut ─────────────────────────────────────────
echo.
echo Creating Desktop shortcut...
set "CHROME=C:\Program Files\Google\Chrome\Application\chrome.exe"
if not exist "%CHROME%" set "CHROME=C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"
if not exist "%CHROME%" (
  echo WARNING: Chrome not found at default path. Shortcut will be created but may not work.
  echo Install Chrome and re-run setup, or edit the shortcut manually.
  set "CHROME=C:\Program Files\Google\Chrome\Application\chrome.exe"
)

set "SHORTCUT=%PUBLIC%\Desktop\Kiosk.lnk"
set "ARGS=--kiosk --disable-pinch --overscroll-history-navigation=0 --disable-features=TranslateUI,Translate --disable-session-crashed-bubble --hide-crash-restore-bubble --load-extension="%DIST%" !KIOSK_URL!"

powershell -NoProfile -Command ^
  "$s=(New-Object -COM WScript.Shell).CreateShortcut('%SHORTCUT%');" ^
  "$s.TargetPath='%CHROME%';" ^
  "$s.Arguments='%ARGS%';" ^
  "$s.WorkingDirectory='%REPO%';" ^
  "$s.Save()"

if exist "%SHORTCUT%" (
  echo [OK] Shortcut created: %SHORTCUT%
) else (
  echo WARNING: Shortcut could not be created. Create it manually (see README).
)

:: ── Done ──────────────────────────────────────────────────────
echo.
echo ============================================================
echo  Setup complete!
echo.
echo  Next: open Chrome ^> chrome://extensions ^> Load unpacked
echo        Select: %DIST%
echo.
echo  Then double-click the Kiosk shortcut on the Desktop.
echo ============================================================
pause
