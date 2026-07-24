# Phase 1: Data Model & Contracts

*(No application-level data models or contracts are introduced in this feature as this focuses strictly on infrastructure and environment standardization).*

## Infrastructure Entities

### `.env` (Root)
- **Primary Source of Truth**: Contains variables for Docker Compose and general system bindings.
- **Key Fields**: `DB_HOST`, `DB_PORT`, `BACKEND_PORT=8080`, `FRONTEND_PORT=3000`.

### `frontend/.env.local`
- **Primary Source of Truth (Frontend Dev)**: Connects Next.js development server to the backend.
- **Key Fields**: `NEXT_PUBLIC_API_URL=http://localhost:8080/api`

### `docker-compose.yml`
- **Profiles**: `full`
- **Volume Bindings**: `postgres_dev_data`, `maven_cache`, `node_modules`
