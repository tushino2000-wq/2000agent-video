@echo off
chcp 65001 >nul
title ANYCHAT
cd /d "%~dp0"

if not exist "node_modules" (
  echo Установка компонентов...
  call npm.cmd install
  if errorlevel 1 (
    echo.
    echo Не удалось установить компоненты. Проверьте установку Node.js.
    pause
    exit /b 1
  )
)

echo.
echo ANYCHAT запускается...
echo Браузер откроется автоматически.
echo Не закрывайте это окно, пока пользуетесь чатом.
echo.

start "" powershell.exe -NoProfile -Command "Start-Sleep -Seconds 3; Start-Process 'http://localhost:8888'"
call npm.cmd run dev -- --offline

echo.
echo Сервер остановлен.
pause
