# Quickstart: Validating the Audit Log System

This guide explains how to validate the end-to-end functionality of the new Audit Log System without looking at the code.

## Prerequisites
- Docker Compose running (`make up -d`).
- Seed users available (`admin` / `staff1`).
- The frontend dev server running (`npm run dev`).

## Scenario 1: Verify Immutability (Database Level)
1. Log into the database directly (e.g., via `docker exec -it laundry-postgres psql -U laundry_admin -d laundry_db`).
2. Attempt to delete a log:
   ```sql
   DELETE FROM audit_logs WHERE id = (SELECT id FROM audit_logs LIMIT 1);
   ```
3. **Expected Outcome**: The database MUST reject the query with the error: `Audit logs are immutable and cannot be altered or deleted.`

## Scenario 2: Verify Frontend UX and Filtering
1. Log into the frontend application as an Admin.
2. Navigate to the new `/audit-logs` dashboard.
3. Apply a filter (e.g., Module: `Orders`, Action: `UPDATE`) using the dropdowns above the table.
4. Click on a specific row.
5. **Expected Outcome**: A side drawer (Sheet) slides out from the right, displaying the human-readable summary and the raw JSON diff of the change.

## Scenario 3: Verify Redaction
1. Log into the application as Admin and change a user's password.
2. Open the Audit Log viewer and find the `UPDATE` event for the `users` table.
3. Open the diff drawer.
4. **Expected Outcome**: The `password` and `password_hash` fields MUST NOT be visible in either the `old_data` or `new_data` JSON payloads.
