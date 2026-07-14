# Compressed Observations

Append-only. Each entry ≤ 3 lines: what was done, what it yielded, what it duplicates (if anything). Never paste raw tool output here.

- [O-001] Searched and inspected client-interview and case-study → Found machine malfunctions and power interruptions as unaddressed pain points.
- [O-002] Searched codebase for "machine" and "minute" → Found "minute" pricing implemented, but "machine" entirely missing except as a UI icon.
- [O-003] Inspected ReportsController → Found basic reporting, but no direct comparative period feature.
- [O-004] Searched for SMS → Found Semaphore SMS implemented.
- [O-005] Research loop stopped → Question answered; major gaps identified.
- [O-006] Searched backend for Machine → Found Machine entity, Service, and Controller, proving backend infrastructure exists for the new feature.
- [O-007] Research loop stopped → State of new feature is already known and documented in implementation plan.
- [O-008] Searched OrderService → found hardcoded 10 machine limit during order creation/update, missing BR-MAC-03 logic (Now Fixed).
- [O-009] Reviewed docs → business-rules.md, user-stories.md missing all machine tracking features (Now Fixed).
- [O-010] Reviewed ERD → erd.dbml missing is_active column on machines (Now Fixed).
- [O-011] Searched MachineService → found hidden 50 machine limit (BR-MAC-04) missing from constitution (Now Fixed).
