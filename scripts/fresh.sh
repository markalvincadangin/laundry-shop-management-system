#!/bin/bash
set -e

echo "Initializing Optimized Fresh Start..."

echo "Stopping backend database service..."
docker compose -f docker-compose.yml -f docker-compose.override.yml stop db backend
docker compose -f docker-compose.yml -f docker-compose.override.yml rm -f db

echo "Wiping database volume..."
VOLUME_NAME=$(docker compose -f docker-compose.yml -f docker-compose.override.yml config | grep -A 2 "^ *postgres_dev_data:" | grep "name:" | awk '{print $2}' | tr -d '"')

if [ -n "$VOLUME_NAME" ] && [ "$VOLUME_NAME" != "null" ]; then
    echo "Removing volume: $VOLUME_NAME"
    docker volume rm "$VOLUME_NAME" -f || true
else
    echo "Could not resolve database volume name. Attempting default..."
    docker volume rm faith-laundry_postgres_dev_data -f || true
fi

echo "Starting database and backend..."
docker compose -f docker-compose.yml -f docker-compose.override.yml up -d db backend

echo "Database reset complete!"
echo "Libraries were preserved, so startup will be MUCH faster."
echo "Run 'docker compose logs -f backend' to see the Flyway migrations and seeding."
