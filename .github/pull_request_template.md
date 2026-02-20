## What changed?
- 

## Why?
- 

## User Stories (if applicable)
- [ ] US-xx: _Description_

## Business Rules (if applicable)
- [ ] BR-xx: _Description_

## How to test
- [ ] Backend: `.\mvnw.cmd test` (Windows) or `./mvnw test` (Unix) in `backend/` (if backend touched)
- [ ] Frontend: `npm run lint && npm run test && npm run build` in `frontend/` (if frontend touched)
- [ ] Database: `docker compose -f docker/docker-compose.yml --env-file docker/.env.docker up -d` from project root (if schema changed)

## Verification checklist
- [ ] Tests pass locally
- [ ] No hardcoded business rules in frontend
- [ ] Entities match [ERD](docs/04-data-design/erd.dbml)
- [ ] APIs match [OpenAPI](docs/05-tech-design/openapi.yaml) contract
- [ ] Documentation updated if behavior changed

## Screenshots (if UI)
-
