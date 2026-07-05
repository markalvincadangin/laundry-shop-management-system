# API Contract: Audit Logs

## `GET /api/v1/audit-logs`

Fetches a paginated list of audit logs with optional filtering. Accessible only to Admins/Owners.

**Query Parameters**:
- `page` (integer, default: 0): Page number.
- `size` (integer, default: 20): Page size.
- `startDate` (string, optional): ISO-8601 date.
- `endDate` (string, optional): ISO-8601 date.
- `module` (string, optional): Filter by `table_name`.
- `action` (string, optional): Filter by `action_type`.

**Response (200 OK)**:
```json
{
  "content": [
    {
      "id": "uuid-1234",
      "createdAt": "2026-07-05T10:00:00Z",
      "actor": "admin_user",
      "action": "UPDATE",
      "module": "orders",
      "entityId": "1001",
      "summary": "Updated order status from RECEIVED to PROCESSING.",
      "diff": {
        "status": { "old": "RECEIVED", "new": "PROCESSING" }
      }
    }
  ],
  "pageable": {
    "pageNumber": 0,
    "pageSize": 20,
    "totalElements": 512,
    "totalPages": 26
  }
}
```

## `GET /api/v1/audit-logs/export`
Exports the audit log based on filters to a CSV format. Accessible only to Admins/Owners.
**Query Parameters**: Same as above.
**Response**: `text/csv` attachment.
