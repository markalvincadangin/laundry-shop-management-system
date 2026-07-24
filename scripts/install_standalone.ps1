# Quick-launch the Laundry Shop Management System installer
# This script simply locates and runs the generated .exe installer.
# The installer itself handles: wizard UI, file extraction, service registration,
# desktop shortcuts, Start Menu, and Add/Remove Programs.
Param(
    [string]$ExePath = ""
)

$ErrorActionPreference = "Stop"

# Auto-detect installer .exe if not provided
if ($ExePath -eq "") {
    $backendTarget = Join-Path $PSScriptRoot "..\backend\target"
    $found = Get-ChildItem -Path $backendTarget -Filter "LaundryShopMS-Setup-*.exe" -ErrorAction SilentlyContinue | Sort-Object LastWriteTime -Descending | Select-Object -First 1
    if ($found) {
        $ExePath = $found.FullName
    } else {
        Write-Error "No installer found. Run .\scripts\build_standalone.ps1 first."
        exit 1
    }
}

Write-Host "Launching installer: $ExePath" -ForegroundColor Cyan
Write-Host "The installation wizard will guide you through the setup." -ForegroundColor Yellow

Start-Process -FilePath $ExePath -Wait
