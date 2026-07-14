# Curated Set

Cap: 25 entries. Importance: critical | high | medium | low.
When full, evict per `least important first` and log the eviction in observations.md. Findings are ≤ 2 sentences; details live behind the evidence link.

| ID | Importance | Finding | Source candidate | Evidence |
|----|------------|---------|------------------|----------|
| E001 | critical | System completely ignores machine entities, tracking, and downtime despite it being the #1 client stressor. | C001 | E001 |
| E002 | medium | System lacks handling for power interruptions (e.g. pausing order timers). | C002 | E002 |
| E003 | refuted (see V004) | Rush orders are acknowledged in BR but lack UI flow or priority queueing to prevent mixing. | C003 | E003 |
| E004 | medium | System lacks comparative analytics (monthly/yearly performance comparison) requested by the Admin in the interview. | C004 | E004 |
| E005 | low | ERD documents `Table notifications`, but JPA entity and DB schema actually use `client_alerts` (minor naming divergence). | C005 | E005 |
| E006 | high | Foreign keys and `ON DELETE CASCADE` exactly match intentional design; no unintended Hibernate JPA cascades exist. | C006 | E006 |
| E007 | high | JPA mappings perfectly respect constitution module boundaries. `customers`, `users`, and `rates` do not import `orders`. | C007 | E007 |
| E008 | low | ERD defines `activity_logs` table, but Flyway schema and JPA entity use `audit_logs` (minor naming drift). | C008 | E008 |
| E009 | critical | OrderService bypassed BR-MAC-03 with hardcoded 10 machine limit (Fixed during Phase 5 alignment). | C009 | E009 |
| E010 | high | Core docs (business-rules, user-stories, erd) were missing machine management feature completely (Fixed during Phase 5 alignment). | C010 | E010 |
