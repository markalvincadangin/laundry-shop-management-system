# Harness Budget Ledger

## Mission
1. Verify whether the current implementation actually solves what the client described in docs/00-context/client-interview.md and docs/00-context/case-study.md — not just whether it satisfies business-rules.md, which may itself have drifted from the original interview (known gaps already found: sorting preferences, physical tagging, rush orders — see docs/06-implementation/traceability-matrix.md). Look for any client-stated pain point that the system doesn't actually address, or addresses differently than described.
2. Audit data integrity across docs/04-data-design/erd.dbml and the actual JPA entity mappings in backend/src. Check: foreign key constraints match the documented relationships, cascade behavior is intentional (not default Hibernate behavior nobody reviewed), and the "Acknowledged Coupling Exception" in the constitution (orders→customers) doesn't hide any other undocumented coupling elsewhere in the schema.
3. research for and verify the new feature added

## Budget
| Resource | Budget | Spent | Remaining |
|----------|-------:|------:|----------:|
| searches | 30 | 17 | 13 |
| inspections | 40 | 7 | 33 |
| verifications | 20 | 12 | 8 |

Context render cap: 4000 tokens per iteration.

## Stop conditions
- Budget exhausted in any resource required for the next action.
- Marginal gain: 3 consecutive actions produced no new curated evidence.
- Mission answered AND every `critical` claim has a `verified` record.

## Action log
| # | Action | Target | Cost | New evidence? |
|---|--------|--------|------|---------------|
| 1 | SEARCH | client-interview.md, case-study.md | 2 searches | Yes |
| 2 | INSPECT | client-interview.md | 1 inspect | Yes |
| 3 | INSPECT | case-study.md | 1 inspect | Yes |
| 4 | SEARCH | "minute", "machine" | 2 searches | Yes |
| 5 | INSPECT | ReportsController | 1 inspect | No |
| 6 | SEARCH | "Semaphore" | 1 search | No |
| 7 | VERIFY | 5 claims | 5 verif, 1 insp | No |
| 8 | SEARCH | "customer history" | 2 searches | Yes (E004) |
| 9 | VERIFY | 1 claim (E004) | 1 verif, 1 search | No |
| 10 | INSPECT | erd.dbml, V1__init.sql | 1 insp | Yes (E005, E006) |
| 11 | SEARCH | JPA relationships | 1 search | No |
| 12 | SEARCH | Cross-feature imports | 3 searches | Yes (E007) |
| 13 | VERIFY | 3 claims (E005-E007) | 3 verif, 1 search | No |
| 14 | SEARCH | auditlog module | 3 searches, 1 insp | Yes (E008) |
| 15 | VERIFY | 1 claim (E008) | 1 verif, 1 search | No |
| 16 | SEARCH | Machine entity | 1 search | No |
| 17 | STOP | Already know state | 0 | No |
| 18 | VERIFY | 2 claims | 2 verif | No |

