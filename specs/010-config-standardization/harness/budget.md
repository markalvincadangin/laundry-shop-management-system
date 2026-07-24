# Harness Budget Ledger

## Mission
1. (not set — pass a question to /speckit.harness.init or /speckit.harness.explore)

## Budget
| Resource | Budget | Spent | Remaining |
|----------|-------:|------:|----------:|
| searches | 30 | 1 | 29 |
| inspections | 40 | 1 | 39 |
| verifications | 20 | 0 | 20 |

Context render cap: 4000 tokens per iteration.

## Stop conditions
- Budget exhausted in any resource required for the next action.
- Marginal gain: 5 consecutive actions produced no new curated evidence.
- Mission answered AND every `critical` claim has a `verified` record.

## Action log
| # | Action | Target | Cost | New evidence? |
|---|--------|--------|------|---------------|
| 1 | INSPECT | DemoDataSeeder.java | 1 inspection | yes |
| 2 | SEARCH | V2__seed_users.sql | 1 search | yes |
