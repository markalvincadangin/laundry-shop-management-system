# Uninstall PostgreSQL and clean up Environment Variables for Laundry Shop Management System
$installDir = "C:\Program Files\PostgreSQL\16"
$uninstallerPath = "$installDir\uninstall-postgresql.exe"

Write-Host "Starting Laundry Shop Management System Environment Cleanup..."

# 1. Uninstall PostgreSQL silently
if (Test-Path $uninstallerPath) {
    Write-Host "Found PostgreSQL 16. Uninstalling silently (this may take a minute)..."
    $process = Start-Process -Wait -FilePath $uninstallerPath -ArgumentList "--mode unattended" -NoNewWindow -PassThru
    
    if ($process.ExitCode -eq 0) {
        Write-Host "PostgreSQL uninstalled successfully."
        # The uninstaller leaves the data directory behind for safety. We will force delete it.
        if (Test-Path $installDir) {
            Write-Host "Cleaning up remaining PostgreSQL files..."
            Remove-Item -Recurse -Force $installDir -ErrorAction SilentlyContinue
        }
    } else {
        Write-Warning "PostgreSQL uninstaller finished with exit code $($process.ExitCode). It may require a manual uninstall from Windows Settings."
    }
} else {
    Write-Host "PostgreSQL 16 not found at $installDir. Skipping database uninstall."
}

# 2. Remove System Environment Variables
Write-Host "Removing System Environment Variables..."
[Environment]::SetEnvironmentVariable("DB_HOST", $null, "Machine")
[Environment]::SetEnvironmentVariable("DB_PORT", $null, "Machine")
[Environment]::SetEnvironmentVariable("DB_NAME", $null, "Machine")
[Environment]::SetEnvironmentVariable("DB_USER", $null, "Machine")
[Environment]::SetEnvironmentVariable("DB_PASSWORD", $null, "Machine")
[Environment]::SetEnvironmentVariable("JWT_SECRET", $null, "Machine")
Write-Host "Environment Variables removed."

Write-Host ""
Write-Host "========================================================"
Write-Host "Environment Cleanup Complete!"
Write-Host "Note: This script only removed the database and secrets."
Write-Host "To uninstall the actual application, please go to:"
Write-Host "Windows Settings -> Apps -> Installed Apps"
Write-Host "Search for 'Laundry Shop Management System' and click Uninstall."
Write-Host "========================================================"
