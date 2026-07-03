@echo off
setlocal
cd /d "%~dp0"
node scripts\discover-fluxion-factory-events.js
echo.
pause
