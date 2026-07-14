#!/bin/bash
set -e

BACKUP_DIR="${1:-./backups}"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
OUTPUT_FILE="$BACKUP_DIR/laundry_db_$TIMESTAMP.sql.gz"

if [ -f .env ]; then
    export $(grep -v '^#' .env | xargs)
fi

DB_USER=${DB_USER:-laundry_user}
DB_NAME=${DB_NAME:-laundry_db}

mkdir -p "$BACKUP_DIR"

CONTAINER=$(docker ps --format "{{.Names}}" | grep -E "^(laundry-postgres-prod|laundry-postgres)$" | head -n 1)

if [ -n "$CONTAINER" ]; then
    echo "Backing up from container $CONTAINER..."
    docker exec "$CONTAINER" pg_dump -U "$DB_USER" -d "$DB_NAME" --no-owner --no-acl | gzip > "$OUTPUT_FILE"
    echo "Backup created: $OUTPUT_FILE"
else
    echo "Error: Database container not found."
    exit 1
fi
