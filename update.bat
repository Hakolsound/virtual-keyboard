@echo off
setlocal EnableDelayedExpansion
echo ============================================================
echo  Virtual Keyboard - Update
echo ============================================================
echo.

set "REPO=%~dp0"
if "%REPO:~-1%"=="\" set "REPO=%REPO:~0,-1%"
set "DIST=%REPO%\dist"
set "URL_FILE=%REPO%\kiosk-url.txt"

:: ── Pull + build ──────────────────────────────────────────────
echo Pulling latest code...
git pull
if %ERRORLEVEL% NEQ 0 ( echo ERROR: git pull failed. Check your internet connection. & pause & exit /b 1 )

echo Building extension...
call npm run build
if %ERRORLEVEL% NEQ 0 ( echo ERROR: build failed. & pause & exit /b 1 )
echo [OK] Build complete.

:: ── Kiosk URL (offer to change) ───────────────────────────────
echo.
set "KIOSK_URL="
if exist "%URL_FILE%" set /p KIOSK_URL=<"%URL_FILE%"
if not "!KIOSK_URL!"=="" echo Current kiosk URL: !KIOSK_URL!
if "!KIOSK_URL!"=="" echo No kiosk URL saved.

set /p CHANGE_URL=Change URL? y/N:
if /i "!CHANGE_URL!"=="y" (
  set /p KIOSK_URL=Enter new kiosk URL:
  echo !KIOSK_URL!>"%URL_FILE%"
  echo [OK] URL updated.

  set "CHROME=C:\Program Files\Google\Chrome\Application\chrome.exe"
  set "CHROME32=C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"
  if not exist "!CHROME!" set "CHROME=!CHROME32!"
  set "SHORTCUT=%PUBLIC%\Desktop\Kiosk.lnk"
  set "ARGS=--kiosk --disable-pinch --overscroll-history-navigation=0 --disable-features=TranslateUI,Translate,AutofillShowTypePredictions,AutofillEnableAccountWalletStorage,AutofillServerCommunication --disable-session-crashed-bubble --hide-crash-restore-bubble --load-extension="!DIST!" !KIOSK_URL!"

  powershell -NoProfile -Command ^
    "$s=(New-Object -COM WScript.Shell).CreateShortcut('!SHORTCUT!');" ^
    "$s.TargetPath='!CHROME!';" ^
    "$s.Arguments='!ARGS!';" ^
    "$s.WorkingDirectory='!REPO!';" ^
    "$s.Save()"
  echo [OK] Desktop shortcut updated.
)

:: ── Done ──────────────────────────────────────────────────────
echo.
echo ============================================================
echo  Update complete!
echo  Go to chrome://extensions and click reload on Virtual Keyboard.
echo ============================================================
pause
