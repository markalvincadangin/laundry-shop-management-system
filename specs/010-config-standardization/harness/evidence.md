# Evidence Links

Pointers only. An entry records WHERE proof lives, not the proof itself.
Excerpts are capped at 25 words. IDs match curated.md (E001, E002…).

<!-- Entry format:
## E001
- Claim: <one sentence>
- Source: <path:lines | URL | command>
- Locator: <function/section/anchor that survives small edits>
- Excerpt: "<= 25 words"
- Supports: <spec.md FR-x / plan.md section / mission #n>
-->

## E001
- Claim: DemoDataSeeder duplicates user seeding and relies on Spring profiles instead of Flyway.
- Source: backend/src/main/java/com/himotech/laundryms/config/seed/DemoDataSeeder.java
- Locator: seedUsersIfMissing() and @Profile("dev")
- Excerpt: "userRepository.save(User.builder().username("admin")...)"
- Supports: mission #1

## E002
- Claim: V2__seed_users.sql does not exist in the codebase.
- Source: backend/src/main/resources/db/migration
- Locator: Directory listing
- Excerpt: "Only V1__init.sql exists."
- Supports: mission #1
