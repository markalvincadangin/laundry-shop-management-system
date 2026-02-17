# Faith Laundry Shop — Database Backup Script (Windows PowerShell)
# Creates a compressed SQL dump: laundry_db_YYYYMMDD_HHMMSS.sql.gz
#
# Usage:
#   .\scripts\backup-database.ps1
#   .\scripts\backup-database.ps1 -BackupDir C:\Backups\laundry
#
# For Task Scheduler (nightly at 2 AM): create a task that runs this script

param(
    [string]$BackupDir = ".\backups"
)

$ErrorActionPreference = "Stop"
$Timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$OutputFile = Join-Path $BackupDir "laundry_db_$Timestamp.sql.gz"

# Load .env if present (project root)
$ProjectRoot = Split-Path $PSScriptRoot -Parent
$EnvFile = Join-Path $ProjectRoot ".env"
if (Test-Path $EnvFile) {
    Get-Content $EnvFile | ForEach-Object {
        if ($_ -match '^\s*([^#][^=]+)=(.*)$') {
            [Environment]::SetEnvironmentVariable($matches[1].Trim(), $matches[2].Trim(), "Process")
        }
    }
}

$DbHost = if ($env:DB_HOST) { $env:DB_HOST } else { "localhost" }
$DbPort = if ($env:DB_PORT) { $env:DB_PORT } else { "5433" }
$DbName = if ($env:DB_NAME) { $env:DB_NAME } else { "laundry_db" }
$DbUser = if ($env:DB_USER) { $env:DB_USER } else { "laundry_user" }
$DbPassword = $env:DB_PASSWORD

New-Item -ItemType Directory -Force -Path $BackupDir | Out-Null

# Try Docker first (production container)
$Container = $null
$Containers = docker ps --format "{{.Names}}" 2>$null
if ($Containers -match "laundry-postgres-prod") { $Container = "laundry-postgres-prod" }
elseif ($Containers -match "laundry-postgres") { $Container = "laundry-postgres" }

if ($Container) {
    docker exec $Container pg_dump -U $DbUser -d $DbName --no-owner --no-acl 2>$null | Out-File -FilePath "$OutputFile.tmp" -Encoding utf8
    # Compress (PowerShell 5.1+)
    $bytes = [System.IO.File]::ReadAllBytes("$OutputFile.tmp")
    $gzip = [System.IO.Compression.GZipStream]::new(
        [System.IO.File]::Create($OutputFile),
        [System.IO.Compression.CompressionMode]::Compress
    )
    $gzip.Write($bytes, 0, $bytes.Length)
    $gzip.Close()
    Remove-Item "$OutputFile.tmp" -Force
    Write-Host "Backup created: $OutputFile"
    exit 0
}

# Fallback: pg_dump if available
$PgDump = Get-Command pg_dump -ErrorAction SilentlyContinue
if ($PgDump) {
    $env:PGPASSWORD = $DbPassword
    & pg_dump -h $DbHost -p $DbPort -U $DbUser -d $DbName --no-owner --no-acl 2>$null | Out-File -FilePath "$OutputFile.tmp" -Encoding utf8
    $env:PGPASSWORD = $null
    $bytes = [System.IO.File]::ReadAllBytes("$OutputFile.tmp")
    $gzip = [System.IO.Compression.GZipStream]::new(
        [System.IO.File]::Create($OutputFile),
        [System.IO.Compression.CompressionMode]::Compress
    )
    $gzip.Write($bytes, 0, $bytes.Length)
    $gzip.Close()
    Remove-Item "$OutputFile.tmp" -Force
    Write-Host "Backup created: $OutputFile"
    exit 0
}

Write-Host "Error: PostgreSQL client (pg_dump) not found, and no laundry-postgres container running."
Write-Host "Install PostgreSQL client tools or ensure the database container is running."
exit 1
