# Compressed Observations

Append-only. Each entry ≤ 3 lines: what was done, what it yielded, what it duplicates (if anything). Never paste raw tool output here.

<!-- Format: - [O-001] (action summary) → outcome; dup-of O-xxx if applicable -->
- [O-001] INSPECT DemoDataSeeder.java → Found @Profile("dev") hardcoded Java seeder that duplicates Flyway V2__seed_users.sql logic.
- [O-002] SEARCH V2__seed_users.sql → Not found in db/migration; exists only in references/tests.
