# scripts/fresh.ps1 — Faith Laundry System "Optimized Reset"
# Equivalent to: php artisan migrate:fresh --seed (WITHOUT redownloading libraries)

# Move to the project root relative to this script
$ProjectRoot = Split-Path -Parent $PSScriptRoot
Push-Location $ProjectRoot

Write-Host "Initializing Optimized Fresh Start..." -ForegroundColor Cyan

# 1. Stop backend and database services
Write-Host "Stopping backend database service..." -ForegroundColor Yellow
docker compose -f docker-compose.yml -f docker-compose.override.yml stop db backend
docker compose -f docker-compose.yml -f docker-compose.override.yml rm -f db

# 2. Wipe ONLY the Database Volume (Keep Maven/Node cache)
Write-Host "Wiping database only..." -ForegroundColor Yellow
# Dynamically get the volume name from docker-compose config to avoid hardcoding
$VolumeName = (docker compose -f docker-compose.yml -f docker-compose.override.yml config --format json | ConvertFrom-Json).volumes.postgres_dev_data.name

if ($VolumeName) {
    Write-Host "Removing volume: $VolumeName" -ForegroundColor Gray
    docker volume rm $VolumeName -f
} else {
    Write-Host "Could not resolve database volume name. Skipping volume removal." -ForegroundColor Red
}

# 3. Start and Re-migrate
Write-Host "Starting database and backend..." -ForegroundColor Yellow
docker compose -f docker-compose.yml -f docker-compose.override.yml up -d db backend

Pop-Location
Write-Host "Database reset complete!" -ForegroundColor Green
Write-Host "Libraries were preserved, so startup will be MUCH faster."
Write-Host "Run 'docker logs -f laundry-backend' to see the Flyway migrations and seeding."
