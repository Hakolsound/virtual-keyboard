@echo off
echo Updating Virtual Keyboard extension...
git pull
if %ERRORLEVEL% NEQ 0 (
  echo ERROR: git pull failed. Check your internet connection.
  pause
  exit /b 1
)
call npm run build
if %ERRORLEVEL% NEQ 0 (
  echo ERROR: build failed.
  pause
  exit /b 1
)
echo.
echo Done! Now go to chrome://extensions and click the reload button on Virtual Keyboard.
pause
