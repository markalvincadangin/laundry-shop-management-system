# Build Standalone Windows Installer with jpackage
Param(
    [string]$AppVersion = "1.0.0"
)

$ErrorActionPreference = "Stop"

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host " Building Faith Laundry Management System (v$AppVersion) " -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan

# 1. Build Frontend Static Export
Write-Host "`n[1/5] Building Frontend Static Export..." -ForegroundColor Yellow
$frontendDir = Resolve-Path (Join-Path $PSScriptRoot "..\frontend")
Set-Location $frontendDir
npm run build

# 2. Copy Static Export into Spring Boot static resources
Write-Host "`n[2/5] Copying Static Frontend into Backend Resources..." -ForegroundColor Yellow
$backendDir = Resolve-Path (Join-Path $PSScriptRoot "..\backend")
$staticDir = Join-Path $backendDir "src\main\resources\static"
if (Test-Path $staticDir) { Remove-Item $staticDir -Recurse -Force }
New-Item -ItemType Directory -Path $staticDir -Force | Out-Null
Copy-Item -Path "$frontendDir\out\*" -Destination $staticDir -Recurse -Force

# 3. Build Executable Jar via Maven
Write-Host "`n[3/5] Packaging Spring Boot Executable JAR via Maven..." -ForegroundColor Yellow
Set-Location $backendDir
mvn clean package -DskipTests

# 4. Prepare Clean Isolated Staging Directory for jpackage
Write-Host "`n[4/5] Preparing Isolated Staging Directory for Installer..." -ForegroundColor Yellow
$stagingDir = Join-Path $backendDir "target\installer-input"
if (Test-Path $stagingDir) { Remove-Item $stagingDir -Recurse -Force }
New-Item -ItemType Directory -Path $stagingDir -Force | Out-Null

$jarName = "laundryms-backend-0.0.1-SNAPSHOT.jar"
Copy-Item -Path "$backendDir\target\$jarName" -Destination "$stagingDir\$jarName" -Force

# 5. Build JRE Runtime via jlink outside staging
Write-Host "`n[5/5] Building Self-Contained JRE Runtime via jlink & Packaging MSI..." -ForegroundColor Yellow
$runtimeDir = Join-Path $backendDir "target\custom-runtime"
if (Test-Path $runtimeDir) { Remove-Item $runtimeDir -Recurse -Force }

jlink --add-modules java.base,java.sql,java.desktop,java.naming,java.management,java.security.jgss,java.instrument,jdk.unsupported,jdk.crypto.ec `
      --output $runtimeDir `
      --strip-debug `
      --no-header-files `
      --no-man-pages

$appName = "Laundry Shop Management System"

jpackage --name "$appName" `
  --input "$stagingDir" `
  --main-jar $jarName `
  --main-class "org.springframework.boot.loader.launch.JarLauncher" `
  --runtime-image $runtimeDir `
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
