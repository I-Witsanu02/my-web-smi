@echo off
setlocal
cd /d "%~dp0"
set "BONEAGE_DEVICE=cpu"
set "BONEAGE_DEMO_ENABLED=0"
echo Configure BONEAGE_USERNAME, BONEAGE_PASSWORD, and BONEAGE_SESSION_SECRET in .env before signing in.
echo Starting Bone Age research application in CPU mode...
echo The first analysis may be slower while the real models load into memory.
if exist ".venv\Scripts\python.exe" (
  set "PYTHON_BIN=%~dp0.venv\Scripts\python.exe"
) else if exist "C:\Program Files\Python311\python.exe" (
  set "PYTHON_BIN=C:\Program Files\Python311\python.exe"
) else (
  set "PYTHON_BIN=python"
)
start "Skeleton Bone Age CPU Server" /min "%PYTHON_BIN%" -m uvicorn app:app --host 127.0.0.1 --port 8766
timeout /t 3 /nobreak >nul
start "" http://127.0.0.1:8766/
endlocal
