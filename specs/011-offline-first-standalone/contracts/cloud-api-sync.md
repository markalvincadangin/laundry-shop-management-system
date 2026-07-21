# Contract: Cloud Sync API

This document defines the contract expected by the `SyncWorker` to communicate with the Cloud API for the offline-first topology.

## Sync Endpoint
`POST https://api.faithlaundry.com/sync/{aggregate_type}`

### Headers
- `Content-Type`: `application/json`
- `Authorization`: `Bearer <jwt_token_or_sync_secret>`

### Path Parameters
- `aggregate_type`: The lowercase string representation of the domain entity (e.g., `orders`, `customers`, `payments`).

### Request Body
The body is a JSON representation of the domain entity, which maps 1:1 with the `payload` JSONB field in `OutboxEvent`.

Example (`aggregate_type: orders`):
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "customerId": "987e6543-e21b-12d3-a456-426614174000",
  "totalLoads": 2,
  "totalAmount": 150.00,
  "status": "COMPLETED",
  "createdAt": "2026-07-14T10:00:00Z"
}
```

### Response
- **Success**: `200 OK` or `201 Created` (Empty body or basic success confirmation).
- **Failure**: Non-2xx status code. This will trigger the `SyncWorker` to increment the `retry_count` and retry the payload later.
- **Idempotency**: The Cloud API **must** handle duplicate submissions for the same `id` gracefully, performing an UPSERT based on the payload (Local Wins conflict resolution).
