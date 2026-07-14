# Data Model: Multi-Machine Management

## Entities

### `Machine`
- **Fields**:
  - `id`: Long (PK)
  - `name`: String (e.g., "Washer 1")
  - `status`: Enum (`OPERATIONAL`, `MAINTENANCE`, `OUT_OF_SERVICE`)
  - `isActive`: Boolean (soft delete)
  - `createdAt`, `updatedAt`: Instant
- **Relationships**:
  - `ManyToMany` with `Order` (via `order_machines` join table).
- **Validation Rules**:
  - `name` cannot be blank.
  - Max 50 machines in the system.

### `Order` (Existing)
- **Modifications**:
  - Add `machines` (`ManyToMany` relationship).

## State Transitions (Machine)
- `OPERATIONAL` <-> `MAINTENANCE`
- `OPERATIONAL` <-> `OUT_OF_SERVICE`

## Constraints
- `Order` in `WASHING` or `DRYING` state MUST hold a lock on its assigned machines.
- No two active `WASHING`/`DRYING` orders can share the same machine at the same time.

### `SystemSettings` (New)
- **Fields**:
  - `id`: Long (PK, locked to 1)
  - `isSystemPaused`: Boolean
  - `updatedAt`: Instant
- **Validation Rules**:
  - Only one row is ever allowed in this table (ID always = 1).
