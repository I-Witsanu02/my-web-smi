$ErrorActionPreference = 'Stop'
$appDirectory = [IO.Path]::GetFullPath((Split-Path -Parent $PSScriptRoot))
foreach ($port in @(8766,8770)) {
    $listeners = @(Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue)
    foreach ($appPid in ($listeners.OwningProcess | Sort-Object -Unique)) {
        $info = Get-CimInstance Win32_Process -Filter "ProcessId = $appPid"
        $command = [string]$info.CommandLine
        $belongs = $command -match [regex]::Escape($appDirectory)
        $isApp = $command -match 'launch_gpu\.py|uvicorn\s+app:app'
        if (-not ($belongs -and $isApp)) {
            Write-Warning "Port $port cannot be verified as this BoneAge installation; nothing stopped."
            continue
        }
        Stop-Process -Id $appPid
        Write-Host "Stopped BoneAge on port $port."
    }
}
