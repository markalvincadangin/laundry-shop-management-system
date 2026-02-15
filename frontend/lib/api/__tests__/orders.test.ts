/**
 * Phase 8 — Orders API module tests.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ordersApi } from "../orders";

const BASE_URL = "http://localhost:8080/api";

describe("ordersApi", () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_API_URL = BASE_URL;
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("list calls GET /v1/orders", async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValue(
      new Response(JSON.stringify([]), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    );

    await ordersApi.list();

    expect(mockFetch).toHaveBeenCalledWith(
      `${BASE_URL}/v1/orders`,
      expect.objectContaining({ method: "GET" })
    );
  });

  it("getById calls GET /v1/orders/:id", async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValue(
      new Response(
        JSON.stringify({
          id: 1,
          referenceNumber: "ORD-001",
          currentStatus: "RECEIVED",
          grandTotal: 100,
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      )
    );

    const result = await ordersApi.getById(1);

    expect(mockFetch).toHaveBeenCalledWith(
      `${BASE_URL}/v1/orders/1`,
      expect.objectContaining({ method: "GET" })
    );
    expect(result.id).toBe(1);
    expect(result.referenceNumber).toBe("ORD-001");
  });

  it("create sends POST with CreateOrderRequest body", async () => {
    const mockFetch = vi.mocked(fetch);
    const body = {
      customerId: 1,
      weightKg: 5,
      extraMinutes: 0,
      addOnIds: [] as number[],
    };
    mockFetch.mockResolvedValue(
      new Response(
        JSON.stringify({
          id: 1,
          referenceNumber: "ORD-001",
          customerId: 1,
          weightKg: 5,
          grandTotal: 150,
        }),
        { status: 201, headers: { "Content-Type": "application/json" } }
      )
    );

    const result = await ordersApi.create(body);

    expect(mockFetch).toHaveBeenCalledWith(
      `${BASE_URL}/v1/orders`,
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify(body),
      })
    );
    expect(result.grandTotal).toBe(150);
  });

  it("trackByReference encodes reference and calls correct path", async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValue(
      new Response(
        JSON.stringify({
          referenceNumber: "ORD-001",
          currentStatus: "WASHING",
          grandTotal: 150,
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      )
    );

    await ordersApi.trackByReference("ORD-001");

    expect(mockFetch).toHaveBeenCalledWith(
      `${BASE_URL}/v1/orders/reference/ORD-001`,
      expect.objectContaining({ method: "GET" })
    );
  });

  it("updateStatus sends PATCH with newStatus", async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValue(
      new Response(
        JSON.stringify({
          id: 1,
          currentStatus: "WASHING",
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      )
    );

    await ordersApi.updateStatus(1, {
      newStatus: "WASHING",
      changedByUserId: "staff-1",
    });

    expect(mockFetch).toHaveBeenCalledWith(
      `${BASE_URL}/v1/orders/1/status`,
      expect.objectContaining({
        method: "PATCH",
        body: JSON.stringify({
          newStatus: "WASHING",
          changedByUserId: "staff-1",
        }),
      })
    );
  });
});
