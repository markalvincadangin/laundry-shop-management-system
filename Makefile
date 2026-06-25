.PHONY: up down build logs clean config test-backend test-frontend

up:
	docker compose --profile full up -d

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
