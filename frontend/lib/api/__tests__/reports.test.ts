/**
 * Phase 8 — Reports API module tests.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { reportsApi } from "../reports";

const BASE_URL = "http://localhost:8080/api";

describe("reportsApi", () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_API_URL = BASE_URL;
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("getDailySales calls GET with date param", async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValue(
      new Response(
        JSON.stringify({
          date: "2025-02-15",
          totalSales: 1500,
          orderCount: 5,
          orders: [],
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      )
    );

    const result = await reportsApi.getDailySales("2025-02-15");

    expect(mockFetch).toHaveBeenCalledWith(
      `${BASE_URL}/v1/reports/sales/daily?date=2025-02-15`,
      expect.objectContaining({ method: "GET" })
    );
    expect(result.date).toBe("2025-02-15");
    expect(result.totalSales).toBe(1500);
  });
});
