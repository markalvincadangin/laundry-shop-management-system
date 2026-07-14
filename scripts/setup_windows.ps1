# Setup PostgreSQL as a Windows Service silently
$pgVersion = "16.2-1"
$installerPath = "postgresql-$pgVersion-windows-x64.exe"
$installDir = "C:\Program Files\PostgreSQL\16"
$dataDir = "$installDir\data"
$password = "laundryadmin123"

Write-Host "Downloading PostgreSQL installer..."
Invoke-WebRequest -Uri "https://get.enterprisedb.com/postgresql/postgresql-$pgVersion-windows-x64.exe" -OutFile $installerPath

Write-Host "Installing PostgreSQL silently..."
Start-Process -Wait -FilePath $installerPath -ArgumentList "--mode unattended --superpassword $password --serverport 5432 --prefix `"$installDir`" --datadir `"$dataDir`"" -NoNewWindow

Write-Host "PostgreSQL Installation Complete."
