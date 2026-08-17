<#
.SYNOPSIS
    Contril Source File Watcher
    Watches Kotlin and resource files in android/app/src/ and triggers dev-device.ps1 on changes.
#>

$projectRoot = Split-Path -Parent $PSScriptRoot
$watchPath = Join-Path $projectRoot "android\app\src"
$deployScript = Join-Path $PSScriptRoot "dev-device.ps1"

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host " CONTRIL LIVE FILE WATCHER & AUTO-DEPLOYMENT" -ForegroundColor Green
Write-Host " Watching: $watchPath" -ForegroundColor Yellow
Write-Host " Press Ctrl+C to stop watcher." -ForegroundColor Gray
Write-Host "==================================================" -ForegroundColor Cyan

$fsw = New-Object System.IO.FileSystemWatcher
$fsw.Path = $watchPath
$fsw.IncludeSubdirectories = $true
$fsw.EnableRaisingEvents = $true
$fsw.NotifyFilter = [System.IO.NotifyFilters]'FileName, LastWrite, CreationTime'

$lastBuildTime = [DateTime]::MinValue
$debounceMilliseconds = 2000

$action = {
    $path = $Event.SourceEventArgs.FullPath
    $changeType = $Event.SourceEventArgs.ChangeType
    
    # Ignore non-source files
    if ($path -notmatch "\.(kt|xml|gradle\.kts|properties|json)$") { return }

    $now = [DateTime]::Now
    $span = ($now - $global:lastBuildTime).TotalMilliseconds
    if ($span -lt $debounceMilliseconds) { return }
    $global:lastBuildTime = $now

    Write-Host "`n>> Change detected in: $(Split-Path $path -Leaf) ($changeType)" -ForegroundColor Yellow
    Write-Host ">> Triggering automatic in-place deployment..." -ForegroundColor Cyan

    try {
        & $deployScript
    } catch {
        Write-Host "[ERROR] Auto-deployment failed: $_" -ForegroundColor Red
    }
}

Register-ObjectEvent $fsw 'Changed' -Action $action | Out-Null
Register-ObjectEvent $fsw 'Created' -Action $action | Out-Null
Register-ObjectEvent $fsw 'Deleted' -Action $action | Out-Null

try {
    while ($true) {
        Start-Sleep -Seconds 1
    }
} finally {
    Unregister-Event -SourceIdentifier $fsw.Id -ErrorAction SilentlyContinue
    $fsw.Dispose()
    Write-Host "`n>> File watcher stopped." -ForegroundColor Yellow
}
