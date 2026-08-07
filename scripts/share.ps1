# =============================================================================
# scripts/share.ps1 — DEVELOPMENT ONLY: Local Dev Server Sharing via Ngrok
# =============================================================================
#
# ⚠️  WARNING — THIS IS NOT THE PRODUCTION REMOTE ACCESS WORKFLOW ⚠️
#
#   This script exposes the local Next.js DEVELOPMENT SERVER (port 3000) via a
#   temporary Ngrok tunnel. It is intended ONLY for:
#     • UI design reviews across devices on a local network
#     • Quick demos during development sessions
#
#   The PRODUCTION remote access workflow uses the Spring Boot backend server
#   (port 8080) and a STATIC DOMAIN configured via the Ngrok authtoken.
#   That workflow is managed by the Windows Service installed via the .exe
#   installer — NOT by this script.
#
#   Do NOT use this script to "share" the system with shop customers.
#   Do NOT run this on the same machine where the production installer service
#   is running — it will conflict with the production Ngrok session.
#
# HOW TO USE:
#   1. Start the dev server first:  npm run dev  (in /frontend)
#   2. Run this script:             .\scripts\share.ps1
#   3. Copy the ngrok forwarding URL and share it with your collaborator.
#   4. Press Ctrl+C to stop.
#
# =============================================================================

$ErrorActionPreference = "Stop"

# Ensure we are in the project root
$ProjectRoot = Split-Path -Parent $PSScriptRoot
Push-Location $ProjectRoot

Write-Host ""
Write-Host "======================================================" -ForegroundColor DarkYellow
Write-Host "  DEV-ONLY: Local Development Server Sharing Script" -ForegroundColor DarkYellow
Write-Host "  NOT for production use. See header comments." -ForegroundColor DarkYellow
Write-Host "======================================================" -ForegroundColor DarkYellow
Write-Host ""

# Guard: refuse to run if the production Windows Service is active
$ServiceName = "LaundryShopMS"
$service = Get-Service -Name $ServiceName -ErrorAction SilentlyContinue
if ($service -and $service.Status -eq "Running") {
    Write-Host "[ABORT] The production $ServiceName Windows Service is currently running." -ForegroundColor Red
    Write-Host "        This script must NOT run alongside the production installer service." -ForegroundColor Red
    Write-Host "        Stop the service first or use the production Ngrok configuration." -ForegroundColor Red
    Pop-Location
    exit 1
}

# Load .env for FRONTEND_PORT
if (Test-Path ".env") {
    Write-Host "[Setup] Loading .env configuration..." -ForegroundColor Gray
    Get-Content .env | ForEach-Object {
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
    Write-Host "[Setup] FRONTEND_PORT not set, defaulting to $FrontendPort" -ForegroundColor Gray
}

# Guard: check ngrok is available
if (!(Get-Command ngrok -ErrorAction SilentlyContinue)) {
    Write-Host "[ERROR] ngrok is not installed or not in PATH." -ForegroundColor Red
    Write-Host "        Install from: https://ngrok.com/download" -ForegroundColor Red
    Pop-Location
    exit 1
}

# Kill any stale ngrok session to avoid conflicts
Write-Host "[Setup] Stopping any existing ngrok sessions..." -ForegroundColor Gray
Stop-Process -Name ngrok -ErrorAction SilentlyContinue
Start-Sleep -Seconds 1

Write-Host "[INFO ] Exposing Next.js dev server at http://localhost:$FrontendPort" -ForegroundColor Cyan
Write-Host "[INFO ] This is the DEVELOPMENT server, not the production Spring Boot API." -ForegroundColor DarkCyan
Write-Host "[INFO ] Press Ctrl+C to stop sharing." -ForegroundColor Yellow
Write-Host ""

# Start ngrok — use a random ephemeral domain (not the registered static domain)
# which is reserved for the production backend tunnel.
ngrok http $FrontendPort --log=stdout

Pop-Location

