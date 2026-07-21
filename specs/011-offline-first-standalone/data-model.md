# Data Model: Offline-First Standalone System Transition

## Entity Changes

All major entities in the system will transition from `BIGSERIAL` (sequential integers) to `UUID` to support local-wins conflict resolution and avoid primary key collisions across disconnected standalone nodes.

### Modified Entities (UUID Transition)
- `users`: `id` -> `UUID`
- `machines`: `id` -> `UUID`
- `customers`: `id` -> `UUID`
- `service_rates`: `id` -> `UUID`
- `add_on_catalog`: `id` -> `UUID`
- `orders`: `id` -> `UUID`, `customer_id` -> `UUID`
- `order_add_ons`: `id` -> `UUID`, `order_id` -> `UUID`, `add_on_id` -> `UUID`
- `order_machine_assignments`: `id` -> `UUID`, `order_id` -> `UUID`, `machine_id` -> `UUID`
- `payments`: `id` -> `UUID`, `order_id` -> `UUID`

## New Entities

### OutboxEvent
Tracks domain events that occurred locally but have not yet been synchronized to the cloud.

**Fields**:
- `id` (UUID): Primary key.
- `aggregate_type` (String): The domain entity type (e.g., `ORDER`, `CUSTOMER`).
- `aggregate_id` (UUID): The UUID of the domain entity.
- `payload` (JSONB): The full serialized state of the domain entity.
- `sync_status` (Enum/String): Current sync state (`PENDING`, `COMPLETED`, `FAILED`).
- `retry_count` (Integer): Number of attempted syncs.
- `created_at` (Timestamp): When the event was recorded.
- `updated_at` (Timestamp): Last update time.

**Validations**:
- `payload` must be valid JSON representing the entity state.
- Events must be published in the same database transaction as the entity mutation.
