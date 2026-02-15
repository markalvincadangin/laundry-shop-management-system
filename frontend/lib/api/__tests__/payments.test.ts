/**
 * Phase 8 — Payments API module tests.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { paymentsApi } from "../payments";

const BASE_URL = "http://localhost:8080/api";

describe("paymentsApi", () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_API_URL = BASE_URL;
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("create sends POST with CreatePaymentRequest body", async () => {
    const mockFetch = vi.mocked(fetch);
    const body = {
      orderId: 1,
      amount: 150,
      paymentMethod: "CASH",
    };
    mockFetch.mockResolvedValue(
      new Response(
        JSON.stringify({
          id: 1,
          orderId: 1,
          amount: 150,
          paymentMethod: "CASH",
        }),
        { status: 201, headers: { "Content-Type": "application/json" } }
      )
    );

    const result = await paymentsApi.create(body);

    expect(mockFetch).toHaveBeenCalledWith(
      `${BASE_URL}/v1/payments`,
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify(body),
      })
    );
    expect(result.amount).toBe(150);
  });

  it("getById calls GET /v1/payments/:id", async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValue(
      new Response(
        JSON.stringify({
          id: 1,
          orderId: 1,
          amount: 150,
          paymentMethod: "CASH",
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      )
    );

    const result = await paymentsApi.getById(1);

    expect(mockFetch).toHaveBeenCalledWith(
      `${BASE_URL}/v1/payments/1`,
      expect.objectContaining({ method: "GET" })
    );
    expect(result.id).toBe(1);
  });
});
