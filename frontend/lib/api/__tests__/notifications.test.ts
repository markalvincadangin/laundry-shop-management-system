/**
 * Phase 10 — Notifications API module tests.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { notificationsApi } from "../notifications";

const BASE_URL = "http://localhost:8080/api";

describe("notificationsApi", () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_API_URL = BASE_URL;
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("list calls GET /v1/notifications", async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValue(
      new Response(
        JSON.stringify([
          {
            id: 1,
            orderId: 10,
            referenceNumber: "LDR-20260215-1234",
            customerId: 5,
            customerName: "John Doe",
            message: "Your order LDR-20260215-1234 is ready for pickup.",
            status: "SENT",
          },
        ]),
        { status: 200, headers: { "Content-Type": "application/json" } }
      )
    );

    const result = await notificationsApi.list();

    expect(mockFetch).toHaveBeenCalledWith(
      `${BASE_URL}/v1/notifications`,
      expect.objectContaining({ method: "GET" })
    );
    expect(result).toHaveLength(1);
    expect(result[0].referenceNumber).toBe("LDR-20260215-1234");
    expect(result[0].status).toBe("SENT");
  });
});
