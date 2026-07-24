# Enterprise Automated Silent Installer / Upgrader for Faith Laundry Management System
Param(
    [string]$MsiPath = "backend\Laundry Shop Management System-1.0.0.msi"
)

$ErrorActionPreference = "Stop"

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host " Faith Laundry Management System Installer Setup " -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan

$absMsiPath = Resolve-Path $MsiPath -ErrorAction SilentlyContinue
if (-not $absMsiPath -or -not (Test-Path $absMsiPath)) {
    Write-Error "Installer file not found at: $MsiPath. Please run .\scripts\build_standalone.ps1 first."
    exit 1
}

# 1. Uninstall any existing version cleanly if present
$appName = "Laundry Shop Management System"
Write-Host "`n[1/2] Checking for existing installation of '$appName'..." -ForegroundColor Yellow

$installed = Get-WmiObject -Class Win32_Product -Filter "Name = '$appName'" -ErrorAction SilentlyContinue
if ($installed) {
    Write-Host "[Uninstall] Removing previous build cleanly..." -ForegroundColor Yellow
    $installed.Uninstall() | Out-Null
    Write-Host "[Uninstall] Previous build removed successfully." -ForegroundColor Green
} else {
    Write-Host "[Check] No conflicting previous build found." -ForegroundColor Green
}

# 2. Perform Clean In-Place Installation
Write-Host "`n[2/2] Installing '$appName'..." -ForegroundColor Yellow
$process = Start-Process -FilePath "msiexec.exe" -ArgumentList "/i `"$absMsiPath`" /qb /norestart" -Wait -PassThru

if ($process.ExitCode -eq 0 -or $process.ExitCode -eq 3010) {
    Write-Host "`n==================================================" -ForegroundColor Green
    Write-Host " SUCCESS! Installation Complete.                  " -ForegroundColor Green
    Write-Host " Desktop shortcut and Start Menu entry created.   " -ForegroundColor Green
    Write-Host "==================================================" -ForegroundColor Green
} else {
    Write-Error "Installation failed with exit code: $($process.ExitCode)"
    exit $process.ExitCode
}
