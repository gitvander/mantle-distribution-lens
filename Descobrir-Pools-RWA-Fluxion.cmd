@echo off
setlocal
cd /d "%~dp0"
node scripts\discover-fluxion-rwa-pools.js
echo.
pause
