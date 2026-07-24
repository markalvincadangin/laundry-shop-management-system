# Install / Upgrade Laundry Shop Management System on Windows
# Extracts deployment ZIP, registers Windows Service, creates Desktop shortcut with icon,
# adds Start Menu entry, and registers in Add/Remove Programs.
Param(
    [string]$InstallDir = "C:\LaundryShopMS",
    [string]$ZipPath = ""
)

$ErrorActionPreference = "Stop"
$appName = "Laundry Shop Management System"
$serviceName = "LaundryShopMS"
$appVersion = "1.0.0"
$publisher = "Himotech"

# Require Administrator
if (-not ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    Write-Error "This script must be run as Administrator. Right-click PowerShell -> Run as Administrator."
    exit 1
}

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host " $appName Installer                               " -ForegroundColor Cyan
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

Write-Host "`n[1/6] Deployment ZIP: $ZipPath" -ForegroundColor Yellow

# ── 2. Stop and unregister existing service ──
$serviceExe = Join-Path $InstallDir "laundryms-service.exe"

if (Get-Service -Name $serviceName -ErrorAction SilentlyContinue) {
    Write-Host "[2/6] Stopping existing service '$serviceName'..." -ForegroundColor Yellow
    Stop-Service -Name $serviceName -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2
    if (Test-Path $serviceExe) {
        Start-Process -FilePath $serviceExe -ArgumentList "uninstall" -Wait -NoNewWindow -ErrorAction SilentlyContinue
    }
    Start-Sleep -Seconds 1
} else {
    Write-Host "[2/6] No existing service found. Fresh install." -ForegroundColor Green
}

# ── 3. Extract deployment ZIP ──
Write-Host "[3/6] Extracting to $InstallDir..." -ForegroundColor Yellow
if (Test-Path $InstallDir) { Remove-Item $InstallDir -Recurse -Force }
New-Item -ItemType Directory -Path $InstallDir -Force | Out-Null
Expand-Archive -Path $ZipPath -DestinationPath $InstallDir -Force

# ── 4. Register Windows Service ──
Write-Host "[4/6] Registering Windows Service..." -ForegroundColor Yellow
$newServiceExe = Join-Path $InstallDir "laundryms-service.exe"
Start-Process -FilePath $newServiceExe -ArgumentList "install" -Wait -NoNewWindow
Start-Service -Name $serviceName
Write-Host "[Service] '$serviceName' installed and started." -ForegroundColor Green

# ── 5. Create Desktop Shortcut & Start Menu Entry with App Icon ──
Write-Host "[5/6] Creating Desktop shortcut and Start Menu entry..." -ForegroundColor Yellow
$iconPath = Join-Path $InstallDir "app.ico"
$shell = New-Object -ComObject WScript.Shell

# Desktop shortcut (opens browser to the app)
$desktopPath = [Environment]::GetFolderPath("CommonDesktopDirectory")
$desktopShortcut = $shell.CreateShortcut("$desktopPath\$appName.lnk")
$desktopShortcut.TargetPath = "http://localhost:8080"
$desktopShortcut.IconLocation = $iconPath
$desktopShortcut.Description = "Open $appName"
$desktopShortcut.Save()

# Start Menu folder and shortcuts
$startMenuDir = Join-Path ([Environment]::GetFolderPath("CommonStartMenu")) "Programs\$appName"
if (-not (Test-Path $startMenuDir)) { New-Item -ItemType Directory -Path $startMenuDir -Force | Out-Null }

$startMenuShortcut = $shell.CreateShortcut("$startMenuDir\$appName.lnk")
$startMenuShortcut.TargetPath = "http://localhost:8080"
$startMenuShortcut.IconLocation = $iconPath
$startMenuShortcut.Description = "Open $appName"
$startMenuShortcut.Save()

Write-Host "[Shortcuts] Desktop and Start Menu entries created with app icon." -ForegroundColor Green

# ── 6. Register in Add/Remove Programs ──
Write-Host "[6/6] Registering in Add/Remove Programs..." -ForegroundColor Yellow
$uninstallKey = "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\$serviceName"
New-Item -Path $uninstallKey -Force | Out-Null
Set-ItemProperty -Path $uninstallKey -Name "DisplayName" -Value $appName
Set-ItemProperty -Path $uninstallKey -Name "DisplayVersion" -Value $appVersion
Set-ItemProperty -Path $uninstallKey -Name "Publisher" -Value $publisher
Set-ItemProperty -Path $uninstallKey -Name "InstallLocation" -Value $InstallDir
Set-ItemProperty -Path $uninstallKey -Name "DisplayIcon" -Value $iconPath
Set-ItemProperty -Path $uninstallKey -Name "UninstallString" -Value "powershell.exe -ExecutionPolicy Bypass -File `"$InstallDir\uninstall.ps1`""
Set-ItemProperty -Path $uninstallKey -Name "NoModify" -Value 1 -Type DWord
Set-ItemProperty -Path $uninstallKey -Name "NoRepair" -Value 1 -Type DWord
Set-ItemProperty -Path $uninstallKey -Name "EstimatedSize" -Value 90000 -Type DWord
Write-Host "[Registry] Registered in Windows Settings > Apps > Installed Apps." -ForegroundColor Green

# Copy uninstall script into install directory for Add/Remove Programs
$uninstallScriptSrc = Join-Path $PSScriptRoot "uninstall_windows.ps1"
if (Test-Path $uninstallScriptSrc) {
    Copy-Item -Path $uninstallScriptSrc -Destination "$InstallDir\uninstall.ps1" -Force
}

Write-Host "`n==================================================" -ForegroundColor Green
Write-Host " SUCCESS! $appName Installed" -ForegroundColor Green
Write-Host "                                                   " -ForegroundColor Green
Write-Host " Location:       $InstallDir" -ForegroundColor White
Write-Host " Service:        $serviceName (Running)" -ForegroundColor White
Write-Host " Desktop:        Shortcut with app icon created" -ForegroundColor White
Write-Host " Start Menu:     $appName folder created" -ForegroundColor White
Write-Host " Add/Remove:     Registered in Windows Settings" -ForegroundColor White
Write-Host " Open:           http://localhost:8080" -ForegroundColor White
Write-Host " Login:          admin / admin123" -ForegroundColor White
Write-Host "==================================================" -ForegroundColor Green

# Open browser
Start-Process "http://localhost:8080"
