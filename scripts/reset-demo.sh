#!/usr/bin/env bash
# ============================================================
# Faith Laundry Shop LMS — Sandbox Demo Data Reset Script
# ============================================================
# Safely truncates operational tables and reapplies baseline
# demo users, machines, customers, orders, and payments.
# Suitable for automated nightly cron jobs.
# ============================================================
set -e

COLOR_CYAN="\033[1;36m"
COLOR_GREEN="\033[1;32m"
COLOR_YELLOW="\033[1;33m"
COLOR_RESET="\033[0m"

echo -e "\n${COLOR_CYAN}[ACTION] Resetting Faith Laundry Shop Demo Sandbox Data...${COLOR_RESET}"

COMPOSE_FILE=""
if docker compose -f docker-compose.prod.yml ps --services --filter "status=running" 2>/dev/null | grep -q "db"; then
    COMPOSE_FILE="docker compose -f docker-compose.prod.yml"
elif docker compose ps --services --filter "status=running" 2>/dev/null | grep -q "db"; then
    COMPOSE_FILE="docker compose"
fi

if [ -z "$COMPOSE_FILE" ]; then
    echo -e "\033[1;31m[ERROR] No running laundry database container found. Start the stack first.\033[0m"
    exit 1
fi

echo -e "${COLOR_YELLOW}[INFO] Executing database reset via $COMPOSE_FILE...${COLOR_RESET}"

# Step 1: Truncate mutable operational tables
$COMPOSE_FILE exec -T db psql -U laundry_user -d laundry_db -c "
TRUNCATE TABLE payments, order_add_ons, order_machines, orders, customers, machines RESTART IDENTITY CASCADE;
" >/dev/null 2>&1 || true

# Step 2: Re-apply baseline demo seed data
$COMPOSE_FILE exec -T -i db psql -U laundry_user -d laundry_db < backend/src/main/resources/db/dev-migration/R__demo_data.sql >/dev/null

echo -e "${COLOR_GREEN}[SUCCESS] Faith Laundry Shop sandbox data successfully restored!${COLOR_RESET}\n"
