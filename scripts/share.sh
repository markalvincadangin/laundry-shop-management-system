#!/bin/bash
set -e

echo "Initializing Public Environment Sharing..."

if [ -f .env ]; then
    export $(grep -v '^#' .env | xargs)
fi

FRONTEND_PORT=${FRONTEND_PORT:-3000}

if ! command -v ngrok &> /dev/null; then
    echo "Ngrok is not installed or not in PATH."
    echo "Install it from: https://ngrok.com/download"
    exit 1
fi

echo "Cleaning up existing ngrok sessions..."
pkill ngrok || true
sleep 1

echo "Note: Ensure ALLOWED_ORIGIN_PATTERNS in .env includes *.ngrok-free.app"
echo "Press Ctrl+C to stop sharing."

if [ -f "ngrok.yml" ]; then
    DOMAIN=$(grep -E '^domain:' ngrok.yml | awk '{print $2}')
    if [ -n "$DOMAIN" ]; then
        echo "Starting ngrok tunnel for port $FRONTEND_PORT with custom domain ($DOMAIN)..."
        ngrok http $FRONTEND_PORT --config ngrok.yml --domain "$DOMAIN"
    else
        echo "Starting ngrok tunnel for port $FRONTEND_PORT using local config..."
        ngrok http $FRONTEND_PORT --config ngrok.yml
    fi
else
    echo "Starting ngrok tunnel for port $FRONTEND_PORT using global config (random domain)..."
    ngrok http $FRONTEND_PORT
fi
