# Contril Release APK Deployment & Checksum Automation Script
# Usage: powershell -ExecutionPolicy Bypass -File ./scripts/publish_release_apk.ps1

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "  Contril Release APK Publish & Integrity Sync" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan

$root = "$PSScriptRoot\.."
$apkSource = "$root\android\app\build\outputs\apk\release\app-release.apk"

if (-not (Test-Path $apkSource)) {
    Write-Host "[*] Release APK not found. Building release APK with Gradle..." -ForegroundColor Yellow
    Set-Location "$root\android"
    .\gradlew.bat assembleRelease
    Set-Location $root
}

if (-not (Test-Path $apkSource)) {
    Write-Error "Failed to locate assembled release APK at $apkSource"
    exit 1
}

# 1. Compute SHA-256 and file size
$hash = (Get-FileHash -Path $apkSource -Algorithm SHA256).Hash.ToLower()
$fileItem = Get-Item -Path $apkSource
$sizeMb = [math]::Round($fileItem.Length / 1MB, 1)

Write-Host "[+] Release APK Found: $apkSource" -ForegroundColor Green
Write-Host "[+] Size: $sizeMb MB ($($fileItem.Length) bytes)" -ForegroundColor Green
Write-Host "[+] SHA-256 Checksum: $hash" -ForegroundColor Green

# 2. Copy to public distribution endpoints
New-Item -ItemType Directory -Force -Path "$root\public\downloads" | Out-Null
New-Item -ItemType Directory -Force -Path "$root\release" | Out-Null

Copy-Item -Force $apkSource "$root\public\downloads\contril-android.apk"
Copy-Item -Force $apkSource "$root\public\app-release.apk"
Copy-Item -Force $apkSource "$root\release\contril-release.apk"
Copy-Item -Force $apkSource "$root\release\app-release.apk"

Write-Host "[+] Synchronized APK to public/ and release/ directories" -ForegroundColor Green

# 3. Output metadata summary
Write-Host "`nRelease Deployment Complete!" -ForegroundColor Cyan
Write-Host "Direct Download URL: /downloads/contril-android.apk" -ForegroundColor White
Write-Host "SHA-256: $hash" -ForegroundColor White
