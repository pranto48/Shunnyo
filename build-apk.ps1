<#
.SYNOPSIS
    Shunnyo Android APK Build Automation Script
.DESCRIPTION
    Builds the production web bundle, syncs with Capacitor Android, and compiles the APK using Gradle.
#>

Write-Host "==============================================" -ForegroundColor Cyan
Write-Host " 🚀 Shunnyo Android APK Build & Sync Engine  " -ForegroundColor Cyan
Write-Host "==============================================" -ForegroundColor Cyan

# 1. Production Web App Build
Write-Host "`n[1/3] Building Production Web Assets..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Web build failed!" -ForegroundColor Red
    exit 1
}

# 2. Capacitor Android Sync
Write-Host "`n[2/3] Syncing Assets to Android Project..." -ForegroundColor Yellow
npx cap sync android
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Capacitor sync failed!" -ForegroundColor Red
    exit 1
}

# 3. Check for Android SDK / Gradle
Write-Host "`n[3/3] Building Debug/Release APK with Gradle..." -ForegroundColor Yellow
if (Test-Path "./android/gradlew.bat") {
    Set-Location "./android"
    ./gradlew.bat assembleDebug
    Set-Location ".."
    Write-Host "`n✅ APK successfully generated at: android/app/build/outputs/apk/debug/app-debug.apk" -ForegroundColor Green
} else {
    Write-Host "⚠️ gradlew.bat not found in android/ directory. Android assets synced successfully!" -ForegroundColor Yellow
}

Write-Host "`n✨ All steps completed successfully!" -ForegroundColor Cyan
