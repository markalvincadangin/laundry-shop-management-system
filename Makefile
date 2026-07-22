.PHONY: up down build logs clean config test-backend test-frontend test backup restore reset fresh setup-env up-dev up-prod

setup-env:
	cp -n .env.example .env || true
	cp -n docker-compose.override.yml.example docker-compose.override.yml || true
	@echo "Initialized environment files. Please update .env if necessary."

up-dev:
	docker compose -f docker-compose.yml -f docker-compose.override.yml --profile full up -d

up-prod:
	docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d

up: up-dev

up-backend:
	docker compose -f docker-compose.yml -f docker-compose.override.yml up -d db backend

down:
	docker compose -f docker-compose.yml -f docker-compose.override.yml --profile full down

build:
	docker compose --profile full build --no-cache

logs:
	docker compose --profile full logs -f

clean:
	docker compose --profile full down -v
	docker system prune -f

config:
	docker compose --profile full config

test-backend:
	docker compose run --rm backend ./mvnw clean test

test-frontend:
	docker compose --profile full run --rm frontend npm test

test: test-backend test-frontend

backup:
	@echo "Creating database backup via Docker..."
	bash ./scripts/backup-database.sh

fresh:
	@echo "Performing fresh reset of database..."
	bash ./scripts/fresh.sh

share:
	@echo "Starting ngrok sharing..."
	bash ./scripts/share.sh
