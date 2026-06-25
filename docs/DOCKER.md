# Docker Local Development Guide

This repository uses a containerized setup to ensure all developers use identical environments. We use `make` as our primary entry point.

## Prerequisites
- Docker & Docker Compose
- Make

## Core Commands

- `make up` - Start the database, backend, and frontend in detached mode. Wait a moment for all services to initialize. *(Note: This uses the `--profile full` flag under the hood so the frontend starts. A default `docker compose up` only starts the backend and database, which is useful if you're only working on APIs.)*
- `make down` - Stop and remove the containers without deleting volumes (your database data is safe).
- `make logs` - Stream logs from all running services to your terminal.
- `make build` - Force a rebuild of all images without using cache.
- `make clean` - Destroys the containers AND removes all volumes (useful if you need a completely fresh database state).

## Testing
- `make test-backend` - Runs the backend test suite via Maven inside its container.
- `make test-frontend` - Runs the frontend test suite via npm inside its container.

## How it Works
Both `backend/Dockerfile` and `frontend/Dockerfile` use multi-stage builds. `docker-compose.yml` explicitly targets the `development` stage in both files.

### Hot Reloading
- The source directories (`./backend` and `./frontend`) are mapped to the `/app` working directory in the containers using bind mounts.
- Changes made locally will instantly trigger a reload in the running containers for both Spring Boot and Next.js.
- **Rollback Note:** If hot-reload breaks for any teammate after a recent change to `docker-compose.yml`, revert via `git revert` rather than patching forward under pressure.

### Overrides
If you need personal database configs or port overrides:
1. Create a `docker-compose.override.yml` in this directory.
2. It's automatically git-ignored so it won't conflict with teammates' configs.
