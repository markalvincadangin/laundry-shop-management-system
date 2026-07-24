# Harness Budget Ledger

## Mission
1. (not set — pass a question to /speckit.harness.init or /speckit.harness.explore)

## Budget
| Resource | Budget | Spent | Remaining |
|----------|-------:|------:|----------:|
| searches | 30 | 0 | 30 |
| inspections | 40 | 0 | 40 |
| verifications | 20 | 0 | 20 |

Context render cap: 4000 tokens per iteration.

## Stop conditions
- Budget exhausted in any resource required for the next action.
- Marginal gain: 3 consecutive actions produced no new curated evidence.
- Mission answered AND every `critical` claim has a `verified` record.

## Action log
| # | Action | Target | Cost | New evidence? |
|---|--------|--------|------|---------------|
