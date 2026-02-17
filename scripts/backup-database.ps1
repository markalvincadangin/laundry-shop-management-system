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
$TempFile = Join-Path $BackupDir "laundry_db_$Timestamp.sql"

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

# Try Docker first (check prod container first, then dev container)
$Container = $null
$Containers = docker ps --format "{{.Names}}" 2>$null
if ($Containers -contains "laundry-postgres-prod") { $Container = "laundry-postgres-prod" }
elseif ($Containers -contains "laundry-postgres") { $Container = "laundry-postgres" }

if ($Container) {
    try {
        # Capture stderr to detect pg_dump failures
        $dumpOutput = docker exec $Container pg_dump -U $DbUser -d $DbName --no-owner --no-acl 2>&1
        if ($LASTEXITCODE -ne 0) {
            Write-Host "Error: pg_dump failed (exit code: $LASTEXITCODE)"
            Write-Host $dumpOutput
            exit 1
        }
        
        # Stream compression using chunked writes to avoid loading entire dump into memory
        $inputStream = [System.IO.MemoryStream]::new([System.Text.Encoding]::UTF8.GetBytes($dumpOutput -join "`n"))
        $outputStream = [System.IO.File]::Create($OutputFile)
        $gzipStream = [System.IO.Compression.GZipStream]::new($outputStream, [System.IO.Compression.CompressionMode]::Compress)
        
        $buffer = New-Object byte[] 8192
        while (($read = $inputStream.Read($buffer, 0, $buffer.Length)) -gt 0) {
            $gzipStream.Write($buffer, 0, $read)
        }
        
        $gzipStream.Close()
        $outputStream.Close()
        $inputStream.Close()
        
        Write-Host "Backup created: $OutputFile"
        exit 0
    }
    catch {
        Write-Host "Error during Docker backup: $_"
        if (Test-Path $OutputFile) { Remove-Item $OutputFile -Force }
        exit 1
    }
}

# Fallback: pg_dump if available
$PgDump = Get-Command pg_dump -ErrorAction SilentlyContinue
if ($PgDump) {
    try {
        $env:PGPASSWORD = $DbPassword
        
        # Capture stderr to detect pg_dump failures
        $dumpOutput = & pg_dump -h $DbHost -p $DbPort -U $DbUser -d $DbName --no-owner --no-acl 2>&1
        if ($LASTEXITCODE -ne 0) {
            $env:PGPASSWORD = $null
            Write-Host "Error: pg_dump failed (exit code: $LASTEXITCODE)"
            Write-Host $dumpOutput
            exit 1
        }
        
        # Stream compression using chunked writes
        $inputStream = [System.IO.MemoryStream]::new([System.Text.Encoding]::UTF8.GetBytes($dumpOutput -join "`n"))
        $outputStream = [System.IO.File]::Create($OutputFile)
        $gzipStream = [System.IO.Compression.GZipStream]::new($outputStream, [System.IO.Compression.CompressionMode]::Compress)
        
        $buffer = New-Object byte[] 8192
        while (($read = $inputStream.Read($buffer, 0, $buffer.Length)) -gt 0) {
            $gzipStream.Write($buffer, 0, $read)
        }
        
        $gzipStream.Close()
        $outputStream.Close()
        $inputStream.Close()
        
        $env:PGPASSWORD = $null
        Write-Host "Backup created: $OutputFile"
        exit 0
    }
    catch {
        $env:PGPASSWORD = $null
        Write-Host "Error during local backup: $_"
        if (Test-Path $OutputFile) { Remove-Item $OutputFile -Force }
        exit 1
    }
}

Write-Host "Error: PostgreSQL client (pg_dump) not found, and no laundry-postgres container running."
Write-Host "Install PostgreSQL client tools or ensure the database container is running."
exit 1
