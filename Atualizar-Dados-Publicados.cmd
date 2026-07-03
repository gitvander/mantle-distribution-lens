@echo off
title Mantle Distribution Lens - V28 Complete Data Refresh
cd /d "%~dp0"
node scripts\refresh-published-data.js
pause
