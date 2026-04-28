# scripts/share.ps1 — Faith Laundry System "Public Sharing"
# Shares the local development environment via ngrok

# Move to the project root relative to this script
$ProjectRoot = Split-Path -Parent $PSScriptRoot
Push-Location $ProjectRoot

Write-Host "Initializing Public Environment Sharing..." -ForegroundColor Cyan

# 1. Load .env variables
if (Test-Path ".env") {
    Write-Host "Loading .env configuration..." -ForegroundColor Gray
    Get-Content .env | ForEach-Object {
        if ($_ -match '^([^#=]+)=(.*)$') {
            $name = $matches[1].Trim()
            $value = $matches[2].Trim()
            Set-Item -Path "Env:\$name" -Value $value
        }
    }
}

$FrontendPort = $env:FRONTEND_PORT
if (!$FrontendPort) {
    $FrontendPort = 3000
    Write-Host "FRONTEND_PORT not found in .env, defaulting to $FrontendPort" -ForegroundColor Gray
}

# 2. Check if ngrok is installed
if (!(Get-Command ngrok -ErrorAction SilentlyContinue)) {
    Write-Host "Ngrok is not installed or not in PATH." -ForegroundColor Red
    Write-Host "Install it from: https://ngrok.com/download"
    Pop-Location
    exit 1
}

# 3. Check if ngrok.yml exists
if (!(Test-Path "ngrok.yml")) {
    Write-Host "ngrok.yml not found in root directory." -ForegroundColor Red
    Pop-Location
    exit 1
}

# 4. Extract domain from ngrok.yml to keep it dynamic
$NgrokConfig = Get-Content "ngrok.yml" -Raw
if ($NgrokConfig -match 'domain:\s*([^\s\r\n]+)') {
    $Domain = $matches[1]
} else {
    Write-Host "Domain not found in ngrok.yml. Please ensure a domain is configured." -ForegroundColor Red
    Pop-Location
    exit 1
}

# 5. Kill existing ngrok processes to ensure a fresh start
Write-Host "Cleaning up existing ngrok sessions..." -ForegroundColor Gray
Stop-Process -Name ngrok -ErrorAction SilentlyContinue
Start-Sleep -Seconds 1

Write-Host "Starting ngrok tunnel for port $FrontendPort..." -ForegroundColor Yellow
Write-Host "Domain: $Domain" -ForegroundColor Gray
Write-Host "Press Ctrl+C to stop sharing."

# Run ngrok using the config for auth but overriding the port and domain from env/config
# This ignores the hardcoded 'addr' in ngrok.yml tunnels section if present
ngrok http $FrontendPort --config ngrok.yml --domain $Domain

Pop-Location
