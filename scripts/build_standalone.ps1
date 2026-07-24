# Build Laundry Shop Management System Installer
# Produces: backend/target/LaundryShopMS-Setup-1.0.0.exe (double-click installer with wizard)
Param(
    [string]$AppVersion = "1.0.0"
)

$ErrorActionPreference = "Stop"

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host " Building Laundry Shop Management System (v$AppVersion) " -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan

# ── 1. Build Frontend Static Export ──
Write-Host "`n[1/5] Building Frontend Static Export..." -ForegroundColor Yellow
$frontendDir = Resolve-Path (Join-Path $PSScriptRoot "..\frontend")
Set-Location $frontendDir
npm run build

# ── 2. Copy Static Export into Spring Boot static resources ──
Write-Host "`n[2/5] Copying Static Frontend into Backend Resources..." -ForegroundColor Yellow
$backendDir = Resolve-Path (Join-Path $PSScriptRoot "..\backend")
$staticDir = Join-Path $backendDir "src\main\resources\static"
if (Test-Path $staticDir) { Remove-Item $staticDir -Recurse -Force }
New-Item -ItemType Directory -Path $staticDir -Force | Out-Null
Copy-Item -Path "$frontendDir\out\*" -Destination $staticDir -Recurse -Force

# ── 3. Build Executable JAR via Maven ──
Write-Host "`n[3/5] Packaging Spring Boot Executable JAR via Maven..." -ForegroundColor Yellow
Set-Location $backendDir
mvn clean package -DskipTests

# ── 4. Stage Deployment Files ──
Write-Host "`n[4/5] Staging Deployment Files..." -ForegroundColor Yellow
$deployDir = Join-Path $backendDir "target\deploy-staging"
if (Test-Path $deployDir) { Remove-Item $deployDir -Recurse -Force }
New-Item -ItemType Directory -Path $deployDir -Force | Out-Null

# Copy application JAR
$jarName = "laundryms-backend-0.0.1-SNAPSHOT.jar"
Copy-Item -Path "$backendDir\target\$jarName" -Destination "$deployDir\laundryms.jar" -Force

# Download WinSW if not cached
$winswCache = Join-Path $env:TEMP "WinSW-x64.exe"
if (-not (Test-Path $winswCache)) {
    Write-Host "[WinSW] Downloading Windows Service Wrapper..." -ForegroundColor Yellow
    $winswUrl = "https://github.com/winsw/winsw/releases/download/v3.0.0-alpha.11/WinSW-x64.exe"
    Invoke-WebRequest -Uri $winswUrl -OutFile $winswCache -UseBasicParsing
}
Copy-Item -Path $winswCache -Destination "$deployDir\laundryms-service.exe" -Force

# ── 5. Compile Installer via Inno Setup ──
Write-Host "`n[5/5] Compiling Windows Installer (.exe) via Inno Setup..." -ForegroundColor Yellow

# Locate Inno Setup compiler
$isccPaths = @(
    "${env:ProgramFiles(x86)}\Inno Setup 6\ISCC.exe",
    "${env:ProgramFiles}\Inno Setup 6\ISCC.exe",
    "C:\Program Files (x86)\Inno Setup 6\ISCC.exe",
    "C:\Program Files\Inno Setup 6\ISCC.exe"
)
$iscc = $isccPaths | Where-Object { Test-Path $_ } | Select-Object -First 1

if (-not $iscc) {
    Write-Host "`n[!] Inno Setup 6 not found. Installing silently..." -ForegroundColor Yellow
    $innoInstallerUrl = "https://jrsoftware.org/download.php/is.exe"
    $innoInstallerPath = Join-Path $env:TEMP "innosetup-installer.exe"
    Invoke-WebRequest -Uri $innoInstallerUrl -OutFile $innoInstallerPath -UseBasicParsing
    Start-Process -FilePath $innoInstallerPath -ArgumentList "/VERYSILENT /SUPPRESSMSGBOXES /NORESTART" -Wait
    $iscc = "${env:ProgramFiles(x86)}\Inno Setup 6\ISCC.exe"
    if (-not (Test-Path $iscc)) {
        Write-Error "Inno Setup installation failed. Please install manually from https://jrsoftware.org/isdl.php"
        exit 1
    }
    Write-Host "[Inno Setup] Installed successfully." -ForegroundColor Green
}

$issFile = Join-Path $PSScriptRoot "installer.iss"
& $iscc $issFile

$exePath = Join-Path $backendDir "target\LaundryShopMS-Setup-$AppVersion.exe"

Write-Host "`n==================================================" -ForegroundColor Green
Write-Host " SUCCESS! Windows Installer generated:            " -ForegroundColor Green
Write-Host " $exePath" -ForegroundColor Green
Write-Host "                                                   " -ForegroundColor Green
Write-Host " Double-click the .exe to install with wizard UI. " -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Green
