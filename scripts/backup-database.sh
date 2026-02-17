#!/bin/sh
# Faith Laundry Shop — Database Backup Script
# Creates a compressed SQL dump: laundry_db_YYYYMMDD_HHMMSS.sql.gz
#
# Usage (from project root or any directory):
#   ./scripts/backup-database.sh
#   ./scripts/backup-database.sh /path/to/backups
#
# For nightly cron (2 AM):
#   0 2 * * * /path/to/laundry-shop-management-system/scripts/backup-database.sh /var/backups/laundry
#
# Requires: PostgreSQL client (pg_dump), or run from inside postgres container

set -e

BACKUP_DIR="${1:-./backups}"
TIMESTAMP="$(date +%Y%m%d_%H%M%S)"
OUTPUT_FILE="${BACKUP_DIR}/laundry_db_${TIMESTAMP}.sql.gz"

# Load .env if present (from project root)
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
if [ -f "$PROJECT_ROOT/.env" ]; then
  set -a
  . "$PROJECT_ROOT/.env"
  set +a
fi

DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5433}"
DB_NAME="${DB_NAME:-laundry_db}"
DB_USER="${DB_USER:-laundry_user}"
DB_PASSWORD="${DB_PASSWORD}"

mkdir -p "$BACKUP_DIR"

# Option A: pg_dump directly (if PostgreSQL client installed)
if command -v pg_dump >/dev/null 2>&1; then
  export PGPASSWORD="$DB_PASSWORD"
  pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" --no-owner --no-acl | gzip > "$OUTPUT_FILE"
  unset PGPASSWORD
  echo "Backup created: $OUTPUT_FILE"
  exit 0
fi

# Option B: via Docker (if postgres container running)
if docker ps --format '{{.Names}}' | grep -q 'laundry-postgres'; then
  CONTAINER="laundry-postgres"
elif docker ps --format '{{.Names}}' | grep -q 'laundry-postgres-prod'; then
  CONTAINER="laundry-postgres-prod"
else
  echo "Error: PostgreSQL client (pg_dump) not found, and no laundry-postgres container running."
  echo "Install PostgreSQL client tools or ensure the database container is running."
  exit 1
fi

docker exec "$CONTAINER" pg_dump -U "${DB_USER}" -d "${DB_NAME}" --no-owner --no-acl | gzip > "$OUTPUT_FILE"
echo "Backup created: $OUTPUT_FILE"
