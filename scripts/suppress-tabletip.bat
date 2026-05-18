@echo off
:: Kills the Windows on-screen keyboard processes.
:: Useful as a startup task or manual run.
taskkill /F /IM TabTip.exe   >nul 2>&1
taskkill /F /IM TabTip32.exe >nul 2>&1
exit /b 0
