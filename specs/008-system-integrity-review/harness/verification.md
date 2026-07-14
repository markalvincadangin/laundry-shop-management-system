# Verification Records

A claim is `verified` only after re-checking the PRIMARY source (not the curated summary). Verdicts: verified | refuted | unverifiable.

| ID | Claim | Method | Verdict | Confidence | Evidence | Date |
|----|-------|--------|---------|------------|----------|------|
| V001 | Customer, Order, and ClientAlert endpoints completely lack @PreAuthorize | grep_search in controllers | refuted | high | N/A | 2026-07-08 |
| V002 | useOrders.ts blindly renders raw backend error messages in toast.error() | grep_search in useOrders.ts | verified | high | N/A | 2026-07-08 |
| V003 | application-prod.yml missing seed_environment Flyway placeholder | viewed application-prod.yml | verified | high | N/A | 2026-07-08 |
| V004 | Rush orders lack UI flow or priority queueing | grep_search for rush in dashboard | refuted | high | E003 | 2026-07-08 |
| V005 | System ignores machine entities and downtime tracking | grep_search for machine | verified | high | E001 | 2026-07-08 |
| V006 | System lacks comparative analytics (monthly/yearly comparison) | grep_search for compare/yearly in reports API | verified | high | E004 | 2026-07-08 |
| V007 | ERD names table notifications while DB uses client_alerts | grep_search in V1__init.sql | verified | high | E005 | 2026-07-08 |
| V008 | Foreign keys match and cascades are DB-only (ON DELETE CASCADE) | view_file Order.java and V1__init.sql | verified | high | E006 | 2026-07-08 |
| V009 | JPA mappings respect module boundaries without undocumented reverse coupling | grep_search across domains | verified | high | E007 | 2026-07-08 |
| V010 | ERD names table activity_logs while DB uses audit_logs | grep_search in V1__init.sql | verified | high | E008 | 2026-07-08 |
| V011 | UpdateOrderStatusRequest exists in backend | grep_search | verified | high | N/A | 2026-07-08 |
| V012 | /machines page exists in frontend dashboard | list_dir | verified | high | N/A | 2026-07-08 |
