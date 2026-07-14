# Candidate Pool

Dedup key: source + topic. One row per candidate, append-only IDs (C001, C002…).
Status: `new` → `inspected` → `curated:<E-id>` | `discarded(<reason>)`.

| ID | Source | Type | Topic | Status | First seen |
|----|--------|------|-------|--------|------------|
| C001 | docs/00-context/client-interview.md | req | Machine malfunctions | curated:E001 | 2026-07-08 |
| C002 | docs/00-context/client-interview.md | req | Power interruptions | curated:E002 | 2026-07-08 |
| C003 | docs/02-requirements/business-rules.md | rule | Rush order mixing | curated:E003 | 2026-07-08 |
| C004 | backend/src/main/java/.../MachineController.java | code | Machine entity | new | 2026-07-08 |
