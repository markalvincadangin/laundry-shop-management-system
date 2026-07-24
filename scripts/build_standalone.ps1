# Build Laundry Shop Management System Deployment Package
# Produces: backend/target/LaundryShopMS-deploy.zip
Param(
    [string]$AppVersion = "1.0.0"
)

$ErrorActionPreference = "Stop"

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host " Building Laundry Shop Management System (v$AppVersion) " -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan

# 1. Build Frontend Static Export
Write-Host "`n[1/4] Building Frontend Static Export..." -ForegroundColor Yellow
$frontendDir = Resolve-Path (Join-Path $PSScriptRoot "..\frontend")
Set-Location $frontendDir
npm run build

# 2. Copy Static Export into Spring Boot static resources
Write-Host "`n[2/4] Copying Static Frontend into Backend Resources..." -ForegroundColor Yellow
$backendDir = Resolve-Path (Join-Path $PSScriptRoot "..\backend")
$staticDir = Join-Path $backendDir "src\main\resources\static"
if (Test-Path $staticDir) { Remove-Item $staticDir -Recurse -Force }
New-Item -ItemType Directory -Path $staticDir -Force | Out-Null
Copy-Item -Path "$frontendDir\out\*" -Destination $staticDir -Recurse -Force

# 3. Build Executable JAR via Maven
Write-Host "`n[3/4] Packaging Spring Boot Executable JAR via Maven..." -ForegroundColor Yellow
Set-Location $backendDir
mvn clean package -DskipTests

# 4. Assemble Deployment Package
Write-Host "`n[4/4] Assembling Deployment Package..." -ForegroundColor Yellow
$deployDir = Join-Path $backendDir "target\deploy-staging"
if (Test-Path $deployDir) { Remove-Item $deployDir -Recurse -Force }
New-Item -ItemType Directory -Path $deployDir -Force | Out-Null
New-Item -ItemType Directory -Path "$deployDir\logs" -Force | Out-Null

# Copy application JAR
$jarName = "laundryms-backend-0.0.1-SNAPSHOT.jar"
Copy-Item -Path "$backendDir\target\$jarName" -Destination "$deployDir\laundryms.jar" -Force

# Copy WinSW service wrapper, config, and app icon
$resourcesDir = Join-Path $PSScriptRoot "resources"
Copy-Item -Path "$resourcesDir\laundryms-service.xml" -Destination "$deployDir\laundryms-service.xml" -Force
Copy-Item -Path "$resourcesDir\start.bat" -Destination "$deployDir\start.bat" -Force
Copy-Item -Path "$resourcesDir\app.ico" -Destination "$deployDir\app.ico" -Force

# Download WinSW if not cached
$winswCache = Join-Path $env:TEMP "WinSW-x64.exe"
if (-not (Test-Path $winswCache)) {
    Write-Host "[WinSW] Downloading Windows Service Wrapper..." -ForegroundColor Yellow
    $winswUrl = "https://github.com/winsw/winsw/releases/download/v3.0.0-alpha.11/WinSW-x64.exe"
    Invoke-WebRequest -Uri $winswUrl -OutFile $winswCache -UseBasicParsing
}
Copy-Item -Path $winswCache -Destination "$deployDir\laundryms-service.exe" -Force

# Create ZIP
$zipPath = Join-Path $backendDir "target\LaundryShopMS-$AppVersion.zip"
if (Test-Path $zipPath) { Remove-Item $zipPath -Force }
Compress-Archive -Path "$deployDir\*" -DestinationPath $zipPath -Force

Write-Host "`n==================================================" -ForegroundColor Green
Write-Host " SUCCESS! Deployment package generated:           " -ForegroundColor Green
Write-Host " $zipPath" -ForegroundColor Green
Write-Host "`n To install on Windows, run:" -ForegroundColor Cyan
Write-Host " .\scripts\install_standalone.ps1" -ForegroundColor Yellow
Write-Host "==================================================" -ForegroundColor Green
