$ErrorActionPreference = 'Stop'
$appDirectory = Split-Path -Parent $PSScriptRoot
$listeners = @(Get-NetTCPConnection -LocalPort 8770 -State Listen -ErrorAction SilentlyContinue)
foreach ($appPid in ($listeners.OwningProcess | Sort-Object -Unique)) {
    $processInfo = Get-CimInstance Win32_Process -Filter "ProcessId = $appPid"
    if ($processInfo.CommandLine -notmatch 'launch_gpu\.py') {
        throw 'Port 8770 belongs to a different process. No process was stopped.'
    }
    $answer = Read-Host 'Restart BoneAge server? Confirm no inference is running (Y/N)'
    if ($answer -ne 'Y') { exit }
    Stop-Process -Id $appPid
}
Start-Process -WindowStyle Hidden -FilePath 'C:\Program Files\Python311\python.exe' -ArgumentList 'scripts\launch_gpu.py' -WorkingDirectory $appDirectory -RedirectStandardOutput "$appDirectory\runtime\gpu_stdout.log" -RedirectStandardError "$appDirectory\runtime\gpu_stderr.log"
Write-Host 'Server starting. Open http://127.0.0.1:8770/#/imaging and refresh with Ctrl+F5.'
