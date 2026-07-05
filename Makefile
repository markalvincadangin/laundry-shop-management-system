.PHONY: up down build logs clean config test-backend test-frontend backup restore reset fresh

up:
	docker compose --profile full up -d

up-backend:
	docker compose up -d db backend

down:
	docker compose --profile full down

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
	docker compose run --rm backend ./mvnw test

test-frontend:
	docker compose --profile full run --rm frontend npm test

backup:
	@echo "Creating database backup via Docker..."
	./scripts/backup-database.sh

fresh:
	@echo "Performing fresh reset of database..."
	docker compose down
	docker volume rm laundry-shop-management-system_postgres_dev_data -f || true
	docker compose up -d db backend
