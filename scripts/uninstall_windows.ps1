# Uninstall Laundry Shop Management System from Windows
# Stops service, unregisters it, removes app files, shortcuts, Start Menu, and Add/Remove Programs entry
Param(
    [string]$InstallDir = "C:\LaundryShopMS",
    [switch]$RemoveDatabase
)

$ErrorActionPreference = "Stop"
$appName = "Laundry Shop Management System"
$serviceName = "LaundryShopMS"

# Require Administrator
if (-not ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    Write-Error "This script must be run as Administrator."
    exit 1
}

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host " $appName Uninstaller                             " -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan

# ── 1. Stop and unregister Windows Service ──
$serviceExe = Join-Path $InstallDir "laundryms-service.exe"

if (Get-Service -Name $serviceName -ErrorAction SilentlyContinue) {
    Write-Host "`n[1/5] Stopping service '$serviceName'..." -ForegroundColor Yellow
    Stop-Service -Name $serviceName -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2
    if (Test-Path $serviceExe) {
        Start-Process -FilePath $serviceExe -ArgumentList "uninstall" -Wait -NoNewWindow
    }
    Write-Host "[Service] Unregistered." -ForegroundColor Green
} else {
    Write-Host "`n[1/5] Service not found. Skipping." -ForegroundColor Yellow
}

# ── 2. Remove application files ──
if (Test-Path $InstallDir) {
    Write-Host "[2/5] Removing application files from $InstallDir..." -ForegroundColor Yellow
    Remove-Item $InstallDir -Recurse -Force
    Write-Host "[Files] Removed." -ForegroundColor Green
} else {
    Write-Host "[2/5] Install directory not found. Skipping." -ForegroundColor Yellow
}

# ── 3. Remove Desktop Shortcut ──
$desktopPath = [Environment]::GetFolderPath("CommonDesktopDirectory")
$shortcutPath = Join-Path $desktopPath "$appName.lnk"
if (Test-Path $shortcutPath) {
    Remove-Item $shortcutPath -Force
    Write-Host "[3/5] Desktop shortcut removed." -ForegroundColor Green
} else {
    Write-Host "[3/5] No desktop shortcut found. Skipping." -ForegroundColor Yellow
}

# ── 4. Remove Start Menu Entry and Add/Remove Programs Registry ──
$startMenuDir = Join-Path ([Environment]::GetFolderPath("CommonStartMenu")) "Programs\$appName"
if (Test-Path $startMenuDir) {
    Remove-Item $startMenuDir -Recurse -Force
    Write-Host "[4/5] Start Menu entry removed." -ForegroundColor Green
} else {
    Write-Host "[4/5] No Start Menu entry found. Skipping." -ForegroundColor Yellow
}

$uninstallKey = "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\$serviceName"
if (Test-Path $uninstallKey) {
    Remove-Item $uninstallKey -Recurse -Force
    Write-Host "[Registry] Add/Remove Programs entry removed." -ForegroundColor Green
}

# ── 5. Optionally remove PostgreSQL and environment variables ──
if ($RemoveDatabase) {
    Write-Host "[5/5] Removing PostgreSQL and environment variables..." -ForegroundColor Yellow

    $pgInstallDir = "C:\Program Files\PostgreSQL\16"
    $uninstallerPath = "$pgInstallDir\uninstall-postgresql.exe"
    if (Test-Path $uninstallerPath) {
        $process = Start-Process -Wait -FilePath $uninstallerPath -ArgumentList "--mode unattended" -NoNewWindow -PassThru
        if ($process.ExitCode -eq 0 -and (Test-Path $pgInstallDir)) {
            Remove-Item -Recurse -Force $pgInstallDir -ErrorAction SilentlyContinue
        }
        Write-Host "[PostgreSQL] Uninstalled." -ForegroundColor Green
    }

    [Environment]::SetEnvironmentVariable("DB_HOST", $null, "Machine")
    [Environment]::SetEnvironmentVariable("DB_PORT", $null, "Machine")
    [Environment]::SetEnvironmentVariable("DB_NAME", $null, "Machine")
    [Environment]::SetEnvironmentVariable("DB_USER", $null, "Machine")
    [Environment]::SetEnvironmentVariable("DB_PASSWORD", $null, "Machine")
    [Environment]::SetEnvironmentVariable("JWT_SECRET", $null, "Machine")
    Write-Host "[Environment] Variables removed." -ForegroundColor Green
} else {
    Write-Host "[5/5] Database preserved. Use -RemoveDatabase to also uninstall PostgreSQL." -ForegroundColor Yellow
}

Write-Host "`n==================================================" -ForegroundColor Green
Write-Host " $appName Uninstalled Successfully.               " -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Green
