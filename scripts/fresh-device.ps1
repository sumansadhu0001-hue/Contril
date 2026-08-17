<#
.SYNOPSIS
    Contril Fresh Install Testing Script
    Uninstalls previous installations, compiles debug APK, performs clean install, and launches app.
#>

# 1. Locate ADB
$adbPath = "C:\Users\suman\AppData\Local\Android\Sdk\platform-tools\adb.exe"
if (-not (Test-Path $adbPath)) {
    $adbCmd = Get-Command "adb" -ErrorAction SilentlyContinue
    if ($adbCmd) {
        $adbPath = $adbCmd.Source
    } else {
        Write-Host "[ERROR] ADB executable not found." -ForegroundColor Red
        exit 1
    }
}

$deviceLines = @(& $adbPath devices | Where-Object { $_ -match "\bdevice$" })

if ($deviceLines.Count -eq 0) {
    Write-Host "`n[ERROR] No Android device connected through USB debugging." -ForegroundColor Red
    exit 1
}

$firstLine = "$($deviceLines[0])".Trim()
$firstDevice = ($firstLine -split '\s+')[0]
Write-Host ">> Target device detected: $firstDevice" -ForegroundColor Green

# 2. Clean previous installations
Write-Host ">> Uninstalling existing Contril installations (Clean slate)..." -ForegroundColor Yellow
& $adbPath -s $firstDevice uninstall com.contril.app.debug
& $adbPath -s $firstDevice uninstall com.contril.app

# 3. Build Debug APK
$projectRoot = Split-Path -Parent $PSScriptRoot
$androidDir = Join-Path $projectRoot "android"
$gradlew = Join-Path $androidDir "gradlew.bat"

Write-Host ">> Compiling Debug APK via Gradle..." -ForegroundColor Cyan
Push-Location $androidDir
try {
    & $gradlew assembleDebug
} finally {
    Pop-Location
}

# 4. Fresh Install
$debugApkPath = Join-Path $androidDir "app\build\outputs\apk\debug\app-debug.apk"
Write-Host ">> Performing fresh install on $firstDevice..." -ForegroundColor Cyan
& $adbPath -s $firstDevice install -r $debugApkPath

# 5. Launch Contril
Write-Host ">> Launching Contril..." -ForegroundColor Cyan
& $adbPath -s $firstDevice shell am start -n com.contril.app.debug/com.contril.app.MainActivity

Write-Host "`n[SUCCESS] Contril fresh install complete on $firstDevice!`n" -ForegroundColor Green
