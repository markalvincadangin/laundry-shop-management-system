# Setup PostgreSQL as a Windows Service silently (Production Ready)
$pgVersion = "16.2-1"
$installerPath = Join-Path $env:TEMP "postgresql-$pgVersion-windows-x64.exe"
$installDir = "C:\Program Files\PostgreSQL\16"
$dataDir = "$installDir\data"

# Check if PostgreSQL is already installed
if (Test-Path "$installDir\bin\pg_ctl.exe") {
    Write-Host "PostgreSQL is already installed at $installDir. Skipping installation."
} else {
    Write-Host "Generating secure random passwords..."
    Add-Type -AssemblyName System.Web
    $password = [System.Web.Security.Membership]::GeneratePassword(24, 6)
    
    Write-Host "Downloading PostgreSQL installer..."
    Invoke-WebRequest -Uri "https://get.enterprisedb.com/postgresql/postgresql-$pgVersion-windows-x64.exe" -OutFile $installerPath

    Write-Host "Installing PostgreSQL silently (this may take a few minutes)..."
    $process = Start-Process -Wait -FilePath $installerPath -ArgumentList "--mode unattended --superpassword `"$password`" --serverport 5432 --prefix `"$installDir`" --datadir `"$dataDir`"" -NoNewWindow -PassThru

    if ($process.ExitCode -ne 0) {
        Write-Error "PostgreSQL installation failed. Rolling back..."
        if (Test-Path $installDir) { Remove-Item -Recurse -Force $installDir }
        exit $process.ExitCode
    }

    # Clean up installer
    Remove-Item $installerPath -Force -ErrorAction SilentlyContinue

    $confFile = "$dataDir\postgresql.conf"
    if (Test-Path $confFile) {
        # Optimize for 4GB-8GB standard POS systems
        (Get-Content $confFile) -replace "^#?shared_buffers\s*=.*", "shared_buffers = 512MB" | Set-Content $confFile
        (Get-Content $confFile) -replace "^#?work_mem\s*=.*", "work_mem = 16MB" | Set-Content $confFile
        (Get-Content $confFile) -replace "^#?maintenance_work_mem\s*=.*", "maintenance_work_mem = 64MB" | Set-Content $confFile
        Write-Host "Configured PostgreSQL for production (tuned memory)"
        Restart-Service -Name "postgresql-x64-16" -Force
    }
    
    Write-Host "Generating secure cryptographic JWT secret..."
    $jwtBytes = New-Object byte[] 32
    [System.Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($jwtBytes)
    $jwtSecret = -join ($jwtBytes | ForEach-Object { $_.ToString("X2") })

    Write-Host "Setting System Environment Variables for FaithLaundryMS..."
    [Environment]::SetEnvironmentVariable("DB_HOST", "localhost", "Machine")
    [Environment]::SetEnvironmentVariable("DB_PORT", "5432", "Machine")
    [Environment]::SetEnvironmentVariable("DB_NAME", "postgres", "Machine")
    [Environment]::SetEnvironmentVariable("DB_USER", "postgres", "Machine")
    [Environment]::SetEnvironmentVariable("DB_PASSWORD", $password, "Machine")
    [Environment]::SetEnvironmentVariable("JWT_SECRET", $jwtSecret, "Machine")
    Write-Host "Environment Variables Set Securely."
    
    Write-Host "PostgreSQL Installation Complete."
}
