# Harness Budget Ledger

## Mission
1. Review the Feature 013 remote-access resilience design and implementation plan against the current codebase and primary documentation before converting it into canonical SpecKit planning artifacts.

## Budget
| Resource | Budget | Spent | Remaining |
|----------|-------:|------:|----------:|
| searches | 30 | 4 | 26 |
| verifications | 20 | 4 | 16 |
| inspections | 40 | 2 | 38 |
| verifications | 20 | 0 | 20 |

Context render cap: 4000 tokens per iteration.

## Stop conditions
- Budget exhausted in any resource required for the next action.
- Marginal gain: 3 consecutive actions produced no new curated evidence.
- Mission answered AND every `critical` claim has a `verified` record.

## Action log
| # | Action | Target | Cost | New evidence? |
|---|--------|--------|------|---------------|
| 1 | SEARCH | Vercel external rewrites and caching | 1 search | Yes |
| 2 | SEARCH | Next.js static-export and rewrites compatibility | 1 search | Yes |
| 3 | INSPECT | Current frontend, backend, installer paths | 1 inspection | Yes |
| 4 | SEARCH | Browser cookie same-site requirements | 1 search | Yes |
| 5 | SEARCH | Ngrok agent endpoint configuration | 1 search | Yes |
| 6 | VERIFY | Vercel external rewrite proxy support | 1 verification | Yes |
| 7 | VERIFY | Next.js static export limitation | 1 verification | Yes |
| 8 | VERIFY | External-origin cache-header behavior | 1 verification | Yes |
| 9 | VERIFY | Current codebase deployment mismatch | 1 verification | Yes |
| 10 | INSPECT | Mutation transaction boundaries and installer scripts | 1 inspection | Yes |
