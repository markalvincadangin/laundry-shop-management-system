# Quickstart Validation Guide

## Purpose
Validate that the Multi-Machine Management feature correctly prevents machine assignment conflicts and is visible in the UI.

## Prerequisites
- Backend running (`docker-compose up -d backend db`)
- Frontend running (`npm run dev`)
- Authenticated as an `ADMIN` user.

## Scenario 1: Configure Machines
1. Navigate to `/overview`.
2. Click **Machines** in the sidebar (under Administration).
3. Ensure at least two machines exist (e.g., "Washer 1", "Washer 2").

## Scenario 2: Concurrency Enforcement
1. Create two new Intake Orders ("Order A" and "Order B") and place them in the queue.
2. In the Orders Queue (`/overview`), find "Order A" and click **START WASHING**.
3. The Machine Assignment modal should appear. Select "Washer 1" and click Assign.
4. "Order A" transitions to WASHING.
5. Find "Order B" and click **START WASHING**.
22. In the modal, "Washer 1" should be grayed out/disabled, preventing you from assigning a busy machine to a second order concurrently.

## Scenario 3: System Pause Enforcement
1. Navigate to Settings (or use Admin API) to set `is_system_paused = true`.
2. A red banner should appear across the UI.
3. In the Orders Queue, attempt to start washing an intake order. The button should be disabled, and the backend should reject it with 409 Conflict.

## Scenario 4: Comparative Analytics
1. Generate test orders for the current month and the previous month.
2. Ensure they are paid.
3. Navigate to `/overview`.
4. The Sales and Orders summary cards should display percentage deltas (e.g., "+15% vs last month") calculated by the backend.
