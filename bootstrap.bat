@echo off
setlocal EnableDelayedExpansion
echo ============================================================
echo  Virtual Keyboard - Bootstrap (fresh machine)
echo  Run as Administrator
echo ============================================================
echo.

:: ── Check admin ──────────────────────────────────────────────
net session >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
  echo ERROR: Please right-click bootstrap.bat and choose "Run as administrator".
  pause & exit /b 1
)

:: ── Git ───────────────────────────────────────────────────────
where git >nul 2>&1
if %ERRORLEVEL% EQU 0 (
  echo [OK] Git already installed.
) else (
  echo Installing Git...
  winget install --id Git.Git -e --source winget --accept-source-agreements --accept-package-agreements
  if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Git install failed. Check internet connection and try again.
    pause & exit /b 1
  )
  :: Refresh PATH so git is available immediately
  set "PATH=%PATH%;C:\Program Files\Git\cmd"
)

:: ── Node.js ───────────────────────────────────────────────────
where node >nul 2>&1
if %ERRORLEVEL% EQU 0 (
  echo [OK] Node.js already installed.
) else (
  echo Installing Node.js...
  winget install --id OpenJS.NodeJS.LTS -e --source winget --accept-source-agreements --accept-package-agreements
  if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js install failed. Check internet connection and try again.
    pause & exit /b 1
  )
  :: Refresh PATH so node is available immediately
  set "PATH=%PATH%;C:\Program Files\nodejs"
)

:: ── Chrome ────────────────────────────────────────────────────
if exist "C:\Program Files\Google\Chrome\Application\chrome.exe" (
  echo [OK] Chrome already installed.
) else if exist "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" (
  echo [OK] Chrome already installed.
) else (
  echo Installing Chrome...
  winget install --id Google.Chrome -e --source winget --accept-source-agreements --accept-package-agreements
  if %ERRORLEVEL% NEQ 0 (
    echo WARNING: Chrome install failed. Install manually from google.com/chrome
  )
)

:: ── Clone repo ────────────────────────────────────────────────
echo.
set "INSTALL_DIR=%USERPROFILE%\virtual-keyboard"
if exist "%INSTALL_DIR%" (
  echo Repo already exists at %INSTALL_DIR%, skipping clone.
) else (
  echo Cloning repository to %INSTALL_DIR%...
  "C:\Program Files\Git\cmd\git.exe" clone https://github.com/Hakolsound/virtual-keyboard.git "%INSTALL_DIR%"
  if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Clone failed. Check internet connection.
    pause & exit /b 1
  )
)

:: ── Run setup.bat ─────────────────────────────────────────────
echo.
echo Launching setup...
cd /d "%INSTALL_DIR%"
call setup.bat
