#!/bin/sh
# Generate self-signed SSL certificate for Faith Laundry Shop
# Run from project root: sh docker/nginx/generate-ssl.sh
# For production with a domain, consider Let's Encrypt (certbot).

set -e
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
SSL_DIR="${SCRIPT_DIR}/ssl"
mkdir -p "$SSL_DIR"

openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout "${SSL_DIR}/key.pem" \
  -out "${SSL_DIR}/cert.pem" \
  -subj "/CN=Faith Laundry Shop/O=Faith Laundry/C=PH"

echo "Self-signed certificate created in ${SSL_DIR}/"
echo "To enable HTTPS: use nginx-ssl.conf (see docker/nginx/README.md)"
