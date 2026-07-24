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
        # Matches name=value, ignores comments, handles optional quotes
        if ($_ -match '^\s*([^#=]+)=(.*)$') {
            $name = $matches[1].Trim()
            $value = $matches[2].Trim().Trim('"').Trim("'")
            [Environment]::SetEnvironmentVariable($name, $value, "Process")
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

# 3. Kill existing ngrok processes to ensure a fresh start
Write-Host "Cleaning up existing ngrok sessions..." -ForegroundColor Gray
Stop-Process -Name ngrok -ErrorAction SilentlyContinue
Start-Sleep -Seconds 1

Write-Host "Note: Ensure ALLOWED_ORIGIN_PATTERNS in .env includes *.ngrok-free.app" -ForegroundColor DarkGray
Write-Host "Press Ctrl+C to stop sharing." -ForegroundColor Yellow

# 4. Run ngrok dynamically
if (Test-Path "ngrok.yml") {
    $NgrokConfig = Get-Content "ngrok.yml" -Raw
    if ($NgrokConfig -match 'domain:\s*([^\s\r\n]+)') {
        $Domain = $matches[1]
        Write-Host "Starting ngrok tunnel for port $FrontendPort with custom domain ($Domain)..." -ForegroundColor Yellow
        ngrok http $FrontendPort --config ngrok.yml --domain $Domain
    } else {
        Write-Host "Starting ngrok tunnel for port $FrontendPort using local config..." -ForegroundColor Yellow
        ngrok http $FrontendPort --config ngrok.yml
    }
} else {
    Write-Host "Starting ngrok tunnel for port $FrontendPort using global config (random domain)..." -ForegroundColor Yellow
    ngrok http $FrontendPort
}

Pop-Location
