/**
 * Dev-only API for Phase 8 (no auth).
 * Returns default staff user ID when backend runs with dev profile.
 */

import { apiClient } from "./client";

export async function getDefaultStaffUserId(): Promise<string | null> {
  try {
    const res = await apiClient.get<{ userId: string }>("/v1/dev/me");
    return res?.userId ?? null;
  } catch {
    return null;
  }
}
