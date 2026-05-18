@echo off
:: Virtual Keyboard Extension — Kiosk Installer
:: Run as Administrator

setlocal

set "EXT_DIR=%~dp0..\dist"
set "CHROME=%ProgramFiles%\Google\Chrome\Application\chrome.exe"
if not exist "%CHROME%" set "CHROME=%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe"

echo.
echo ══════════════════════════════════════════
echo  Virtual Keyboard — Kiosk Setup
echo ══════════════════════════════════════════
echo.

:: ── 1. Suppress Windows touch keyboard (TabTip) ───────────────────────────
echo [1/4] Disabling Windows touch keyboard...
reg add "HKLM\SOFTWARE\Policies\Microsoft\TabletPC" /v PreventLaunchingTouchKeyboard /t REG_DWORD /d 1 /f >nul 2>&1
reg add "HKLM\SOFTWARE\Microsoft\TabletTip\1.7"    /v DisableNewKeyboardExperience  /t REG_DWORD /d 1 /f >nul 2>&1
:: Kill any running instance
taskkill /F /IM TabTip.exe  >nul 2>&1
taskkill /F /IM TabTip32.exe >nul 2>&1
echo    Done.

:: ── 2. Disable Windows tablet mode auto-keyboard on sign-in ───────────────
reg add "HKCU\SOFTWARE\Microsoft\TabletTip\1.7" /v EnableKeyboardUndockedState /t REG_DWORD /d 0 /f >nul 2>&1
reg add "HKCU\SOFTWARE\Microsoft\TabletTip\1.7" /v LastUsedModalityWasHandwriting /t REG_DWORD /d 0 /f >nul 2>&1

:: ── 3. Create Chrome kiosk shortcut on Desktop ────────────────────────────
echo [2/4] Creating Chrome kiosk shortcut...

set "SHORTCUT=%USERPROFILE%\Desktop\Kiosk.lnk"
set "TARGET_URL=https://your-kiosk-app.com"
:: Replace TARGET_URL above with the actual kiosk app URL

powershell -NoProfile -Command ^
  "$ws = New-Object -ComObject WScript.Shell; ^
   $s = $ws.CreateShortcut('%SHORTCUT%'); ^
   $s.TargetPath = '%CHROME%'; ^
   $s.Arguments = '--kiosk --disable-pinch --overscroll-history-navigation=0 --disable-features=TranslateUI,Translate --disable-session-crashed-bubble --hide-crash-restore-bubble --load-extension=\"%EXT_DIR%\"  %TARGET_URL%'; ^
   $s.Save()" >nul 2>&1
echo    Shortcut created at %SHORTCUT%
echo    ^! Edit TARGET_URL in this script to set the actual kiosk URL.

:: ── 4. Register TabTip kill at startup ────────────────────────────────────
echo [3/4] Registering TabTip suppressor at startup...
schtasks /create /tn "VKB-SuppressTabTip" ^
  /tr "taskkill /F /IM TabTip.exe" ^
  /sc onlogon /ru "%USERNAME%" /f >nul 2>&1
echo    Done.

:: ── 5. Summary ─────────────────────────────────────────────────────────────
echo [4/4] Summary
echo.
echo    Extension path : %EXT_DIR%
echo    Chrome path    : %CHROME%
echo    Desktop shortcut created.
echo    Windows touch keyboard disabled.
echo.
echo  IMPORTANT: Edit TARGET_URL in this .bat before deploying.
echo  Then launch Chrome using the Desktop shortcut.
echo.
echo ══════════════════════════════════════════
pause
