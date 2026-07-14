# Quickstart Validation Guide: Frontend UI Polish

This guide explains how to validate the UI polish implementation locally.

## Prerequisites
- Docker daemon running.
- Local environment configured via `docs/development-credentials.md`.

## Setup
1. Start the frontend development server: `npm run dev` (from `frontend/` directory).
2. Start the backend services (if needed for data loading): `make run-backend`.

## Validation Scenarios

1. **Architecture Isolation**
   - Run `npm run lint` in the `frontend/` directory.
   - **Expected:** Zero ESLint errors regarding imports from `src/app/` inside `src/components/`.

2. **Doherty Threshold (Loading States)**
   - Navigate to the Dashboard (`/overview`).
   - Hard refresh the page.
   - **Expected:** Skeleton loaders appear instantly (<400ms) before data populates.

3. **Kanban Concurrency & Scrolling**
   - Resize the browser window to < 1200px width.
   - **Expected:** The Kanban board displays a horizontal scrollbar rather than collapsing columns.
   - Click an order's "Next Stage" button.
   - **Expected:** The card moves instantly (optimistic UI), without waiting for the network response.
