@echo off
setlocal
cd /d "%~dp0"
echo Starting Skeleton Bone Age MVP...
set "BONEAGE_DEMO_ENABLED=0"
echo Configure BONEAGE_USERNAME, BONEAGE_PASSWORD, and BONEAGE_SESSION_SECRET in .env before signing in.
if exist "C:\Program Files\Python311\python.exe" (
  set "PYTHON_BIN=C:\Program Files\Python311\python.exe"
) else (
  set "PYTHON_BIN=python"
)
start "Skeleton Bone Age Server" /min "%PYTHON_BIN%" -m uvicorn app:app --host 127.0.0.1 --port 8766
timeout /t 3 /nobreak >nul
start "" http://127.0.0.1:8766/
endlocal
