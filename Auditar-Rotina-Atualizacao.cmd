@echo off
title Mantle Distribution Lens - Update Routine Audit
cd /d "%~dp0"
node scripts\audit-update-state.js
pause
