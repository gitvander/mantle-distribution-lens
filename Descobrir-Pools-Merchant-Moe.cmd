@echo off
setlocal
cd /d "%~dp0"
node scripts\discover-merchant-moe-pools.js
echo.
pause
