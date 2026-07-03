@echo off
title Mantle Distribution Lens - Complete Data Refresh
cd /d "%~dp0"
echo Este atalho agora usa o atualizador completo do Lens.
echo Ele atualiza snapshots historicos, rotas, TVL e cotacoes verificadas.
node scripts\refresh-published-data.js
pause
