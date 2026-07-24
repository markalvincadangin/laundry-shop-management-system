# Build Standalone Windows Installer with jpackage
Param(
    [string]$AppVersion = "1.0.0"
)

$ErrorActionPreference = "Stop"

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host " Building Faith Laundry Management System (v$AppVersion) " -ForegroundColor Cyan
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

# 3. Build Executable Jar via Maven
Write-Host "`n[3/4] Packaging Spring Boot Executable JAR via Maven..." -ForegroundColor Yellow
Set-Location $backendDir
mvn clean package -DskipTests

# 4. Package Native Windows Installer via jpackage
Write-Host "`n[4/4] Generating Native Windows Installer (.msi)..." -ForegroundColor Yellow
$appName = "Laundry Shop Management System"
$jarName = "laundryms-backend-0.0.1-SNAPSHOT.jar"

jpackage --name "$appName" `
  --input target `
  --main-jar $jarName `
  --app-version $AppVersion `
  --type msi `
  --win-dir-chooser `
  --win-shortcut `
  --win-menu `
  --java-options "-Xmx512m -Dspring.profiles.active=prod" `
  --verbose

Write-Host "`n==================================================" -ForegroundColor Green
Write-Host " SUCCESS! Professional MSI Installer generated: " -ForegroundColor Green
Write-Host " $backendDir\$appName-$AppVersion.msi" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Green
