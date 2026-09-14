@echo off
setlocal
cd /d "%~dp0"
set "BONEAGE_DEVICE=cpu"
set "BONEAGE_DEMO_ENABLED=0"
set "BONEAGE_ALLOWED_ORIGINS=https://web-livid-six-41.vercel.app"
echo Starting authenticated CPU backend for a Vercel connection...
echo Public demo uploads are disabled. Sign-in is required for prediction.
if exist "C:\Program Files\Python311\python.exe" (
  set "PYTHON_BIN=C:\Program Files\Python311\python.exe"
) else (
  set "PYTHON_BIN=python"
)
"%PYTHON_BIN%" -m uvicorn app:app --host 127.0.0.1 --port 8766
endlocal
