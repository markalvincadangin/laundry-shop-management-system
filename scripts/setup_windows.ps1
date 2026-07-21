# Setup PostgreSQL as a Windows Service silently
$pgVersion = "16.2-1"
$installerPath = "postgresql-$pgVersion-windows-x64.exe"
$installDir = "C:\Program Files\PostgreSQL\16"
$dataDir = "$installDir\data"
$password = "laundryadmin123"

Write-Host "Downloading PostgreSQL installer..."
Invoke-WebRequest -Uri "https://get.enterprisedb.com/postgresql/postgresql-$pgVersion-windows-x64.exe" -OutFile $installerPath

Write-Host "Installing PostgreSQL silently..."
$process = Start-Process -Wait -FilePath $installerPath -ArgumentList "--mode unattended --superpassword $password --serverport 5432 --prefix `"$installDir`" --datadir `"$dataDir`"" -NoNewWindow -PassThru

if ($process.ExitCode -ne 0) {
    Write-Error "PostgreSQL installation failed. Rolling back..."
    if (Test-Path $installDir) { Remove-Item -Recurse -Force $installDir }
    exit $process.ExitCode
}

$confFile = "$dataDir\postgresql.conf"
if (Test-Path $confFile) {
    (Get-Content $confFile) -replace "^#?shared_buffers\s*=.*", "shared_buffers = 128MB" | Set-Content $confFile
    Write-Host "Configured shared_buffers=128MB"
    Restart-Service -Name "postgresql-x64-16" -Force
}

Write-Host "PostgreSQL Installation Complete."

Write-Host "Setting System Environment Variables for FaithLaundryMS..."
[Environment]::SetEnvironmentVariable("DB_HOST", "localhost", "Machine")
[Environment]::SetEnvironmentVariable("DB_PORT", "5432", "Machine")
[Environment]::SetEnvironmentVariable("DB_NAME", "postgres", "Machine")
[Environment]::SetEnvironmentVariable("DB_USER", "postgres", "Machine")
[Environment]::SetEnvironmentVariable("DB_PASSWORD", $password, "Machine")
[Environment]::SetEnvironmentVariable("JWT_SECRET", "default-offline-jwt-secret-key-123456", "Machine")
Write-Host "Environment Variables Set."
