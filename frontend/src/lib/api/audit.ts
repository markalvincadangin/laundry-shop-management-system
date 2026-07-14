import { AuditLogPageResponse } from "../validation/audit";

export async function fetchAuditLogs(
  params: {
    page?: number;
    size?: number;
    q?: string;
    action?: string;
    from?: string;
    to?: string;
  }
): Promise<AuditLogPageResponse> {
  const queryParams = new URLSearchParams();
  if (params.page !== undefined) queryParams.append("page", params.page.toString());
  if (params.size !== undefined) queryParams.append("size", params.size.toString());
  if (params.q) queryParams.append("q", params.q);
  if (params.action) queryParams.append("action", params.action);
  if (params.from) queryParams.append("from", params.from);
  if (params.to) queryParams.append("to", params.to);

  const res = await fetch(`/api/v1/audit-logs?${queryParams.toString()}`);
  if (!res.ok) {
    throw new Error("Failed to fetch audit logs");
  }
  return res.json();
}
