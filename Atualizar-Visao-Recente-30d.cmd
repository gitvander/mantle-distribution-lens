@echo off
title Mantle Distribution Lens - Complete Data Refresh
cd /d "%~dp0"
echo Este atalho agora usa o atualizador completo do Lens.
echo A visao recente antiga nao deve mais ser usada como rotina principal.
node scripts\refresh-published-data.js
pause
