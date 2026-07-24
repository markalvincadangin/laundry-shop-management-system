# Install / Upgrade Laundry Shop Management System on Windows
# Extracts deployment ZIP, registers Windows Service, creates Desktop shortcut
Param(
    [string]$InstallDir = "C:\LaundryShopMS",
    [string]$ZipPath = ""
)

$ErrorActionPreference = "Stop"

# Require Administrator
if (-not ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    Write-Error "This script must be run as Administrator. Right-click PowerShell -> Run as Administrator."
    exit 1
}

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host " Laundry Shop Management System Installer         " -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan

# Auto-detect ZIP if not provided
if ($ZipPath -eq "") {
    $backendTarget = Join-Path $PSScriptRoot "..\backend\target"
    $found = Get-ChildItem -Path $backendTarget -Filter "LaundryShopMS-*.zip" -ErrorAction SilentlyContinue | Sort-Object LastWriteTime -Descending | Select-Object -First 1
    if ($found) {
        $ZipPath = $found.FullName
    } else {
        Write-Error "No deployment ZIP found. Run .\scripts\build_standalone.ps1 first."
        exit 1
    }
}

Write-Host "`n[1/4] Deployment ZIP: $ZipPath" -ForegroundColor Yellow

# Stop and unregister existing service if present
$serviceName = "LaundryShopMS"
$serviceExe = Join-Path $InstallDir "laundryms-service.exe"

if (Get-Service -Name $serviceName -ErrorAction SilentlyContinue) {
    Write-Host "[2/4] Stopping existing service '$serviceName'..." -ForegroundColor Yellow
    Stop-Service -Name $serviceName -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2
    if (Test-Path $serviceExe) {
        Start-Process -FilePath $serviceExe -ArgumentList "uninstall" -Wait -NoNewWindow -ErrorAction SilentlyContinue
    }
    Start-Sleep -Seconds 1
} else {
    Write-Host "[2/4] No existing service found. Fresh install." -ForegroundColor Green
}

# Extract deployment ZIP
Write-Host "[3/4] Extracting to $InstallDir..." -ForegroundColor Yellow
if (Test-Path $InstallDir) { Remove-Item $InstallDir -Recurse -Force }
New-Item -ItemType Directory -Path $InstallDir -Force | Out-Null
Expand-Archive -Path $ZipPath -DestinationPath $InstallDir -Force

# Register Windows Service
Write-Host "[4/4] Registering Windows Service..." -ForegroundColor Yellow
$newServiceExe = Join-Path $InstallDir "laundryms-service.exe"
Start-Process -FilePath $newServiceExe -ArgumentList "install" -Wait -NoNewWindow
Start-Service -Name $serviceName
Write-Host "[Service] '$serviceName' installed and started." -ForegroundColor Green

# Create Desktop Shortcut
$desktopPath = [Environment]::GetFolderPath("CommonDesktopDirectory")
$shortcutPath = Join-Path $desktopPath "Laundry Shop Management System.lnk"
$shell = New-Object -ComObject WScript.Shell
$shortcut = $shell.CreateShortcut($shortcutPath)
$shortcut.TargetPath = "http://localhost:8080"
$shortcut.Description = "Open Laundry Shop Management System"
$shortcut.Save()
Write-Host "[Shortcut] Desktop shortcut created." -ForegroundColor Green

Write-Host "`n==================================================" -ForegroundColor Green
Write-Host " SUCCESS! Laundry Shop Management System Installed" -ForegroundColor Green
Write-Host "                                                   " -ForegroundColor Green
Write-Host " Location:  $InstallDir" -ForegroundColor White
Write-Host " Service:   $serviceName (Running)" -ForegroundColor White
Write-Host " Open:      http://localhost:8080" -ForegroundColor White
Write-Host " Login:     admin / admin123" -ForegroundColor White
Write-Host "==================================================" -ForegroundColor Green

# Open browser
Start-Process "http://localhost:8080"
