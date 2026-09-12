@echo off
title DEAD : THE HALLOWEEN MASSACRE
cd /d "%~dp0"

echo ========================================================
echo        DEAD : THE HALLOWEEN MASSACRE
echo       Amiga 1200 AGA Retro 2.5D FPS Engine
echo ========================================================
echo.
echo Avvio del server locale su http://localhost:8000/ ...
echo.

start "" "http://localhost:8000/"
node server.js

pause
