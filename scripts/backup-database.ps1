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
        # Redirect stdout to temp file, stderr separately to check for errors
        $stderrFile = Join-Path $BackupDir "stderr_$Timestamp.tmp"
        
        # Execute pg_dump: stdout to temp file, stderr to separate file
        $process = Start-Process -FilePath "docker" `
            -ArgumentList "exec", $Container, "pg_dump", "-U", $DbUser, "-d", $DbName, "--no-owner", "--no-acl" `
            -RedirectStandardOutput $TempFile `
            -RedirectStandardError $stderrFile `
            -NoNewWindow -Wait -PassThru
        
        if ($process.ExitCode -ne 0) {
            $errorMsg = ""
            if (Test-Path $stderrFile) {
                $errorMsg = Get-Content $stderrFile -Raw
            }
            Write-Host "Error: pg_dump failed (exit code: $($process.ExitCode))"
            if ($errorMsg) { Write-Host $errorMsg }
            Remove-Item $stderrFile -Force -ErrorAction SilentlyContinue
            exit 1
        }
        
        # Clean up stderr file (successful dump may have warnings, but we have exit code 0)
        Remove-Item $stderrFile -Force -ErrorAction SilentlyContinue
        
        # Stream compression from temp file to avoid loading entire dump into memory
        $inputStream = [System.IO.File]::OpenRead($TempFile)
        $outputStream = [System.IO.File]::Create($OutputFile)
        $gzipStream = [System.IO.Compression.GZipStream]::new($outputStream, [System.IO.Compression.CompressionMode]::Compress)
        
        $buffer = New-Object byte[] 8192
        while (($read = $inputStream.Read($buffer, 0, $buffer.Length)) -gt 0) {
            $gzipStream.Write($buffer, 0, $read)
        }
        
        $gzipStream.Close()
        $outputStream.Close()
        $inputStream.Close()
        
        # Clean up temp file
        Remove-Item $TempFile -Force
        
        Write-Host "Backup created: $OutputFile"
        exit 0
    }
    catch {
        Write-Host "Error during Docker backup: $_"
        if (Test-Path $OutputFile) { Remove-Item $OutputFile -Force }
        if (Test-Path $TempFile) { Remove-Item $TempFile -Force }
        exit 1
    }
}

# Fallback: pg_dump if available
$PgDump = Get-Command pg_dump -ErrorAction SilentlyContinue
if ($PgDump) {
    try {
        $env:PGPASSWORD = $DbPassword
        $stderrFile = Join-Path $BackupDir "stderr_$Timestamp.tmp"
        
        # Execute pg_dump: stdout to temp file, stderr separately
        $process = Start-Process -FilePath "pg_dump" `
            -ArgumentList "-h", $DbHost, "-p", $DbPort, "-U", $DbUser, "-d", $DbName, "--no-owner", "--no-acl" `
            -RedirectStandardOutput $TempFile `
            -RedirectStandardError $stderrFile `
            -NoNewWindow -Wait -PassThru
        
        $env:PGPASSWORD = $null
        
        if ($process.ExitCode -ne 0) {
            $errorMsg = ""
            if (Test-Path $stderrFile) {
                $errorMsg = Get-Content $stderrFile -Raw
            }
            Write-Host "Error: pg_dump failed (exit code: $($process.ExitCode))"
            if ($errorMsg) { Write-Host $errorMsg }
            Remove-Item $stderrFile -Force -ErrorAction SilentlyContinue
            exit 1
        }
        
        # Clean up stderr file
        Remove-Item $stderrFile -Force -ErrorAction SilentlyContinue
        
        # Stream compression from temp file
        $inputStream = [System.IO.File]::OpenRead($TempFile)
        $outputStream = [System.IO.File]::Create($OutputFile)
        $gzipStream = [System.IO.Compression.GZipStream]::new($outputStream, [System.IO.Compression.CompressionMode]::Compress)
        
        $buffer = New-Object byte[] 8192
        while (($read = $inputStream.Read($buffer, 0, $buffer.Length)) -gt 0) {
            $gzipStream.Write($buffer, 0, $read)
        }
        
        $gzipStream.Close()
        $outputStream.Close()
        $inputStream.Close()
        
        # Clean up temp file
        Remove-Item $TempFile -Force
        
        Write-Host "Backup created: $OutputFile"
        exit 0
    }
    catch {
        $env:PGPASSWORD = $null
        Write-Host "Error during local backup: $_"
        if (Test-Path $OutputFile) { Remove-Item $OutputFile -Force }
        if (Test-Path $TempFile) { Remove-Item $TempFile -Force }
        exit 1
    }
}

Write-Host "Error: PostgreSQL client (pg_dump) not found, and no laundry-postgres container running."
Write-Host "Install PostgreSQL client tools or ensure the database container is running."
exit 1
