#!/usr/bin/env bash
set -euo pipefail
VERSION="${1:-1.0.0}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
"$SCRIPT_DIR/build-deployment.sh" "$VERSION"
if command -v powershell.exe >/dev/null 2>&1 && command -v wslpath >/dev/null 2>&1; then
  WIN_SCRIPT="$(wslpath -w "$SCRIPT_DIR/build-installer.ps1")"
  powershell.exe -NoProfile -ExecutionPolicy Bypass -File "$WIN_SCRIPT" -Version "$VERSION"
else
  echo "Staging completed. Run build-installer.ps1 on Windows to compile the Inno Setup package."
fi
