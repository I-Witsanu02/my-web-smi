@echo off
cd /d "%~dp0"
if not exist "runtime" mkdir "runtime"
if exist ".venv\Scripts\python.exe" (
  set "PYTHON_BIN=%~dp0.venv\Scripts\python.exe"
) else if exist "C:\Program Files\Python311\python.exe" (
  set "PYTHON_BIN=C:\Program Files\Python311\python.exe"
) else (
  set "PYTHON_BIN=python"
)
powershell -NoProfile -Command "if (-not (Get-NetTCPConnection -LocalPort 8770 -State Listen -ErrorAction SilentlyContinue)) { Start-Process -WindowStyle Hidden -FilePath '%PYTHON_BIN%' -ArgumentList 'scripts\launch_gpu.py' -WorkingDirectory '%~dp0' -RedirectStandardOutput 'runtime\gpu_stdout.log' -RedirectStandardError 'runtime\gpu_stderr.log' }"
start "" http://127.0.0.1:8770/#/imaging
