# Curated Set

Cap: 25 entries. Importance: critical | high | medium | low.
When full, evict per `oldest/lowest importance` and log the eviction in observations.md. Findings are ≤ 2 sentences; details live behind the evidence link.

| ID | Importance | Finding | Source candidate | Evidence |
|----|------------|---------|------------------|----------|
| E001 | high | DemoDataSeeder uses @Profile("dev") but duplicates Flyway user seeding. Industry standard is Flyway environment-specific migrations (e.g. R__demo_data.sql) or separating to src/test. | C001 | E001 |
| E002 | high | V2__seed_users.sql is mentioned in docs but does not exist in src/main/resources/db/migration. DemoDataSeeder.java was likely created to replace it without updating the docs. | C002 | E002 |
