#!/bin/bash
# Build Laundry Shop Management System Deployment Staging Package
# Produces: backend/target/deploy-staging/ (JAR + WinSW + resources)
set -e

APP_VERSION="${1:-1.0.0}"

echo "=================================================="
echo " Building Laundry Shop Management System (v$APP_VERSION) "
echo "=================================================="

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# 1. Build Frontend Static Export
echo ""
echo "[1/4] Building Frontend Static Export..."
cd "$PROJECT_ROOT/frontend"
npm run build

# 2. Copy Static Export into Spring Boot static resources
echo ""
echo "[2/4] Copying Static Frontend into Backend Resources..."
STATIC_DIR="$PROJECT_ROOT/backend/src/main/resources/static"
rm -rf "$STATIC_DIR"
mkdir -p "$STATIC_DIR"
cp -r "$PROJECT_ROOT/frontend/out/"* "$STATIC_DIR/"

# 3. Build Executable JAR via Maven
echo ""
echo "[3/4] Packaging Spring Boot Executable JAR via Maven..."
cd "$PROJECT_ROOT/backend"
./mvnw clean package -DskipTests

# 4. Stage Deployment Files
echo ""
echo "[4/4] Staging Deployment Files..."
DEPLOY_DIR="$PROJECT_ROOT/backend/target/deploy-staging"
rm -rf "$DEPLOY_DIR"
mkdir -p "$DEPLOY_DIR"

# Copy application JAR
cp "$PROJECT_ROOT/backend/target/laundryms-backend-0.0.1-SNAPSHOT.jar" "$DEPLOY_DIR/laundryms.jar"

# Download WinSW if not cached
WINSW_CACHE="/tmp/WinSW-x64.exe"
if [ ! -f "$WINSW_CACHE" ]; then
    echo "[WinSW] Downloading Windows Service Wrapper..."
    curl -sSL "https://github.com/winsw/winsw/releases/download/v3.0.0-alpha.11/WinSW-x64.exe" -o "$WINSW_CACHE"
fi
cp "$WINSW_CACHE" "$DEPLOY_DIR/laundryms-service.exe"

# Download PostgreSQL installer if not cached
PG_VERSION="16.2-1"
PG_CACHE="/tmp/postgresql-$PG_VERSION-windows-x64.exe"
if [ ! -f "$PG_CACHE" ]; then
    echo "[PostgreSQL] Downloading PostgreSQL $PG_VERSION installer..."
    curl -sSL "https://get.enterprisedb.com/postgresql/postgresql-$PG_VERSION-windows-x64.exe" -o "$PG_CACHE"
fi
cp "$PG_CACHE" "$DEPLOY_DIR/postgresql-$PG_VERSION-windows-x64.exe"

echo ""
echo "=================================================="
echo " Deployment files staged successfully:           "
echo " $DEPLOY_DIR"
echo ""
echo " Note: Run .\\scripts\\build-installer.ps1 on Windows"
echo " to compile the final .exe installer via Inno Setup."
echo "=================================================="
