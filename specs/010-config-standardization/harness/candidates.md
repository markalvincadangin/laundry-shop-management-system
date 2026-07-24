# Candidate Pool

Dedup key: source + topic. One row per candidate, append-only IDs (C001, C002…).
Status: `new` → `inspected` → `curated:<E-id>` | `discarded(<reason>)`.

| ID | Source | Type | Topic | Status | First seen |
|----|--------|------|-------|--------|------------|
| C001 | DemoDataSeeder.java | file | Data seeding | curated:E001 | 2026-07-14 |
| C002 | V2__seed_users.sql | file | Data seeding | curated:E002 | 2026-07-14 |
