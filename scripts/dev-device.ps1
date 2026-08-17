<#
.SYNOPSIS
    Contril USB In-Place Development Deployment Script
    Builds debug APK, installs in-place via ADB preserving all user session data, and launches the app.
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
    Write-Host "Please ensure your phone is connected with USB Debugging enabled." -ForegroundColor Yellow
    exit 1
}

$firstLine = "$($deviceLines[0])".Trim()
$firstDevice = ($firstLine -split '\s+')[0]
Write-Host ">> Target device detected: $firstDevice" -ForegroundColor Green

# 2. Build Debug APK
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

# 3. Locate generated Debug APK
$debugApkPath = Join-Path $androidDir "app\build\outputs\apk\debug\app-debug.apk"
if (-not (Test-Path $debugApkPath)) {
    Write-Host "[ERROR] Debug APK not found at: $debugApkPath" -ForegroundColor Red
    exit 1
}

# 4. In-Place Update (Preserves user session, preferences, OAuth, and local state)
Write-Host ">> Updating Contril on device in-place (Preserving app data)..." -ForegroundColor Cyan
& $adbPath -s $firstDevice install -r -d $debugApkPath

# 5. Launch / Restart Contril
Write-Host ">> Launching Contril on device..." -ForegroundColor Cyan
& $adbPath -s $firstDevice shell am start -n com.contril.app.debug/com.contril.app.MainActivity

Write-Host "`n[SUCCESS] Contril in-place development update complete on $firstDevice!`n" -ForegroundColor Green
