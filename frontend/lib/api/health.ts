import { apiClient, ApiError } from "./client";

/**
 * Probes backend availability.
 * Uses public tracking endpoint (GET /v1/orders/reference/{ref}) — no auth required.
 * 200 = ref found (unlikely); 404 = API reached, ref not found; network/5xx = API unreachable.
 */
export async function checkHealth(): Promise<{ ok: boolean; error?: string }> {
  try {
    await apiClient.get<unknown>("/v1/orders/reference/__health_probe__");
    return { ok: true }; // Ref exists (unlikely)
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) {
      return { ok: true }; // API reached, ref not found
    }
    const message =
      err instanceof ApiError
        ? `${err.status} ${err.code}: ${err.message}`
        : err instanceof Error
          ? err.message
          : "Network error";
    return { ok: false, error: message };
  }
}
