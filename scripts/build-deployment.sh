#!/usr/bin/env bash
# Production deployment staging for Laundry Shop Management System.
# Run from WSL/Linux. Final Inno compilation is performed by build-installer.ps1 on Windows.
set -euo pipefail

APP_VERSION="${1:-1.0.0}"
WINSW_VERSION="v2.12.0"
WINSW_SHA256="${WINSW_SHA256:-05b82d46ad331cc16bdc00de5c6332c1ef818df8ceefcd49c726553209b3a0da}"
TEMURIN_TAG="jdk-21.0.11+10"
TEMURIN_ASSET="OpenJDK21U-jre_x64_windows_hotspot_21.0.11_10.zip"
TEMURIN_JRE_SHA256="${TEMURIN_JRE_SHA256:-be26677aaa20b39a62edcaab4c8857a8b76673b0f45abc0b6143b142b62717e4}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
CACHE_DIR="$PROJECT_ROOT/.cache/deployment"
DEPLOY_DIR="$PROJECT_ROOT/backend/target/deploy-staging"
mkdir -p "$CACHE_DIR"

for cmd in curl python3 unzip sha256sum npm; do
  command -v "$cmd" >/dev/null || { echo "Missing required tool: $cmd" >&2; exit 1; }
done

if [[ ! "$APP_VERSION" =~ ^[0-9]+\.[0-9]+\.[0-9]+([.-][A-Za-z0-9.-]+)?$ ]]; then
  echo "Invalid application version: $APP_VERSION" >&2
  exit 1
fi

GITHUB_HEADERS=(-H "Accept: application/vnd.github+json" -H "X-GitHub-Api-Version: 2026-03-10")
if [[ -n "${GITHUB_TOKEN:-}" ]]; then
  GITHUB_HEADERS+=(-H "Authorization: Bearer $GITHUB_TOKEN")
fi

get_github_asset_metadata() {
  local repo="$1" tag="$2" asset="$3" override_hash="${4:-}"
  local json
  json="$(curl -fsSL "${GITHUB_HEADERS[@]}" "https://api.github.com/repos/$repo/releases/tags/$tag")"
  python3 -c 'import json,sys
asset_name=sys.argv[1]
override=sys.argv[2].strip().lower()
data=json.load(sys.stdin)
for a in data.get("assets", []):
    if a.get("name") == asset_name:
        digest=(a.get("digest") or "").lower()
        if digest.startswith("sha256:"):
            digest=digest.split(":",1)[1]
        if not digest:
            digest=override
        if not digest:
            raise SystemExit(f"GitHub release asset {asset_name} has no published digest. Set the documented SHA256 override environment variable.")
        print(a["browser_download_url"])
        print(digest)
        raise SystemExit(0)
raise SystemExit(f"Asset not found: {asset_name}")' "$asset" "$override_hash" <<<"$json"
}

download_verified() {
  local url="$1" expected="$2" dest="$3"
  if [[ -f "$dest" ]]; then
    local actual
    actual="$(sha256sum "$dest" | awk '{print tolower($1)}')"
    if [[ "$actual" == "${expected,,}" ]]; then
      echo "[cache] verified $(basename "$dest")"
      return
    fi
    rm -f "$dest"
  fi
  curl -fL --retry 3 --connect-timeout 20 "$url" -o "$dest"
  local actual
  actual="$(sha256sum "$dest" | awk '{print tolower($1)}')"
  [[ "$actual" == "${expected,,}" ]] || { echo "SHA-256 mismatch for $dest" >&2; rm -f "$dest"; exit 1; }
}

echo "=================================================="
echo " Laundry Shop Management System v$APP_VERSION"
echo " Production deployment staging"
echo "=================================================="

if [[ -f "$SCRIPT_DIR/installer-static-check.py" ]]; then
  echo "[preflight] Running installer static safety checks..."
  python3 "$SCRIPT_DIR/installer-static-check.py"
fi

echo "[1/6] Building frontend static export..."
cd "$PROJECT_ROOT/frontend"
# Architecture contract: the installer payload always uses the standalone/static-export target.
NEXT_DEPLOYMENT_TARGET=standalone npm run build
if [[ ! -d "$PROJECT_ROOT/frontend/out" ]]; then
  echo "frontend/out was not produced. Configure Next.js for static export (output: 'export') before packaging." >&2
  exit 1
fi

STATIC_DIR="$PROJECT_ROOT/backend/src/main/resources/static"
rm -rf "$STATIC_DIR"
mkdir -p "$STATIC_DIR"
cp -a "$PROJECT_ROOT/frontend/out/." "$STATIC_DIR/"

echo "[2/6] Running backend verification build..."
cd "$PROJECT_ROOT/backend"
./mvnw clean verify

JAR_PATH="$(find "$PROJECT_ROOT/backend/target" -maxdepth 1 -type f -name '*.jar' ! -name '*-sources.jar' ! -name '*-javadoc.jar' ! -name 'original-*' | sort | head -n1)"
[[ -n "$JAR_PATH" ]] || { echo "Executable backend JAR not found." >&2; exit 1; }

echo "[3/6] Resolving and verifying WinSW $WINSW_VERSION..."
mapfile -t WINSW_META < <(get_github_asset_metadata "winsw/winsw" "$WINSW_VERSION" "WinSW-x64.exe" "${WINSW_SHA256:-}")
WINSW_URL="${WINSW_META[0]}"; WINSW_HASH="${WINSW_META[1]}"
WINSW_CACHE="$CACHE_DIR/WinSW-x64-$WINSW_VERSION.exe"
download_verified "$WINSW_URL" "$WINSW_HASH" "$WINSW_CACHE"

echo "[4/6] Resolving and verifying Eclipse Temurin Java 21 runtime..."
mapfile -t JRE_META < <(get_github_asset_metadata "adoptium/temurin21-binaries" "$TEMURIN_TAG" "$TEMURIN_ASSET" "${TEMURIN_JRE_SHA256:-}")
JRE_URL="${JRE_META[0]}"; JRE_HASH="${JRE_META[1]}"
JRE_CACHE="$CACHE_DIR/$TEMURIN_ASSET"
download_verified "$JRE_URL" "$JRE_HASH" "$JRE_CACHE"

echo "[5/6] Staging production payload..."
rm -rf "$DEPLOY_DIR"
mkdir -p "$DEPLOY_DIR/runtime"
cp "$JAR_PATH" "$DEPLOY_DIR/laundryms.jar"
cp "$WINSW_CACHE" "$DEPLOY_DIR/laundryms-service.exe"

JRE_TMP="$(mktemp -d)"
trap 'rm -rf "$JRE_TMP"' EXIT
unzip -q "$JRE_CACHE" -d "$JRE_TMP"
JRE_ROOT="$(find "$JRE_TMP" -mindepth 1 -maxdepth 1 -type d | head -n1)"
[[ -n "$JRE_ROOT" && -f "$JRE_ROOT/bin/java.exe" ]] || { echo "Temurin archive layout is unexpected; bin/java.exe not found." >&2; exit 1; }
cp -a "$JRE_ROOT/." "$DEPLOY_DIR/runtime/"

[[ -f "$DEPLOY_DIR/runtime/bin/java.exe" ]] || { echo "Bundled runtime staging failed." >&2; exit 1; }

echo "[6/6] Writing deployment manifest..."
JAR_HASH="$(sha256sum "$DEPLOY_DIR/laundryms.jar" | awk '{print $1}')"
JAVA_EXE_HASH="$(sha256sum "$DEPLOY_DIR/runtime/bin/java.exe" | awk '{print $1}')"
cat > "$DEPLOY_DIR/deployment-manifest.txt" <<MANIFEST
ApplicationVersion=$APP_VERSION
WinSWVersion=$WINSW_VERSION
WinSWSHA256=$WINSW_HASH
JavaVendor=Eclipse Temurin
JavaVersion=21.0.11+10
JavaRuntimeAsset=$TEMURIN_ASSET
JavaRuntimeSHA256=$JRE_HASH
JavaExeSHA256=$JAVA_EXE_HASH
ApplicationJarSHA256=$JAR_HASH
MANIFEST

echo "Deployment payload ready: $DEPLOY_DIR"
echo "Next: run .\\scripts\\build-installer.ps1 -Version $APP_VERSION from Windows PowerShell."
