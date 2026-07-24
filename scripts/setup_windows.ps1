# Setup PostgreSQL and Cloudflare Tunnel as Windows Services (Production Ready)
Param(
    [string]$CloudflareToken = ""
)

$ErrorActionPreference = "Stop"

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host " Setting Up Faith Laundry Shop Host Environment   " -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan

$pgVersion = "16.2-1"
$installerPath = Join-Path $env:TEMP "postgresql-$pgVersion-windows-x64.exe"
$installDir = "C:\Program Files\PostgreSQL\16"
$dataDir = "$installDir\data"

# 1. PostgreSQL Setup
if (Test-Path "$installDir\bin\pg_ctl.exe") {
    Write-Host "`n[PostgreSQL] Already installed at $installDir. Skipping." -ForegroundColor Yellow
} else {
    Write-Host "`n[PostgreSQL] Generating secure random database password..." -ForegroundColor Yellow
    $rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
    $bytes = New-Object byte[] 18
    $rng.GetBytes($bytes)
    $password = [Convert]::ToBase64String($bytes) -replace '[+/=]', 'a'
    
    Write-Host "[PostgreSQL] Downloading installer v$pgVersion..." -ForegroundColor Yellow
    Invoke-WebRequest -Uri "https://get.enterprisedb.com/postgresql/postgresql-$pgVersion-windows-x64.exe" -OutFile $installerPath

    Write-Host "[PostgreSQL] Installing silently as Windows Service..." -ForegroundColor Yellow
    $process = Start-Process -Wait -FilePath $installerPath -ArgumentList "--mode unattended --superpassword `"$password`" --serverport 5432 --prefix `"$installDir`" --datadir `"$dataDir`"" -NoNewWindow -PassThru

    if ($process.ExitCode -ne 0) {
        Write-Error "PostgreSQL installation failed."
        if (Test-Path $installDir) { Remove-Item -Recurse -Force $installDir }
        exit $process.ExitCode
    }

    Remove-Item $installerPath -Force -ErrorAction SilentlyContinue

    $confFile = "$dataDir\postgresql.conf"
    if (Test-Path $confFile) {
        (Get-Content $confFile) -replace "^#?shared_buffers\s*=.*", "shared_buffers = 512MB" | Set-Content $confFile
        (Get-Content $confFile) -replace "^#?work_mem\s*=.*", "work_mem = 16MB" | Set-Content $confFile
        (Get-Content $confFile) -replace "^#?maintenance_work_mem\s*=.*", "maintenance_work_mem = 64MB" | Set-Content $confFile
        Write-Host "[PostgreSQL] Performance tuned (shared_buffers=512MB)." -ForegroundColor Green
        Restart-Service -Name "postgresql-x64-16" -Force
    }
    
    Write-Host "`n[Security] Generating 64-character JWT secret..." -ForegroundColor Yellow
    $jwtBytes = New-Object byte[] 32
    [System.Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($jwtBytes)
    $jwtSecret = -join ($jwtBytes | ForEach-Object { $_.ToString("X2") })

    Write-Host "[Security] Saving Machine Environment Variables..." -ForegroundColor Yellow
    [Environment]::SetEnvironmentVariable("DB_HOST", "localhost", "Machine")
    [Environment]::SetEnvironmentVariable("DB_PORT", "5432", "Machine")
    [Environment]::SetEnvironmentVariable("DB_NAME", "postgres", "Machine")
    [Environment]::SetEnvironmentVariable("DB_USER", "postgres", "Machine")
    [Environment]::SetEnvironmentVariable("DB_PASSWORD", $password, "Machine")
    [Environment]::SetEnvironmentVariable("JWT_SECRET", $jwtSecret, "Machine")
    Write-Host "[Security] Environment Variables Configured." -ForegroundColor Green
}

# 2. Cloudflare Tunnel Setup (Optional)
if ($CloudflareToken -ne "") {
    Write-Host "`n[Cloudflare] Downloading cloudflared daemon..." -ForegroundColor Yellow
    $cfPath = Join-Path $env:TEMP "cloudflared.exe"
    Invoke-WebRequest -Uri "https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe" -OutFile $cfPath
    
    Write-Host "[Cloudflare] Installing cloudflared Windows Service..." -ForegroundColor Yellow
    Start-Process -Wait -FilePath $cfPath -ArgumentList "service install $CloudflareToken" -NoNewWindow
    Write-Host "[Cloudflare] Windows Service Installed & Active." -ForegroundColor Green
} else {
    Write-Host "`n[Cloudflare] No -CloudflareToken passed. Cloudflare service setup skipped." -ForegroundColor Yellow
}

Write-Host "`n==================================================" -ForegroundColor Green
Write-Host " HOST SETUP COMPLETE! Ready for Application Installer " -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Green
