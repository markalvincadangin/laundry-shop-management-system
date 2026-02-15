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
      amountPaid: 150,
      paymentMethod: "CASH" as const,
      receivedByUserId: "staff-1",
    };
    mockFetch.mockResolvedValue(
      new Response(
        JSON.stringify({
          id: 1,
          orderId: 1,
          amountPaid: 150,
          paymentMethod: "CASH",
          paymentDate: "2025-02-15T10:00:00Z",
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
    expect(result.amountPaid).toBe(150);
  });

  it("list calls GET /v1/payments with optional params", async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValue(
      new Response(
        JSON.stringify({
          content: [{ id: 1, orderId: 1, amountPaid: 150 }],
          page: 0,
          size: 20,
          totalElements: 1,
          totalPages: 1,
          first: true,
          last: true,
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      )
    );

    const result = await paymentsApi.list();

    expect(mockFetch).toHaveBeenCalledWith(
      `${BASE_URL}/v1/payments`,
      expect.objectContaining({ method: "GET" })
    );
    expect(result.content).toHaveLength(1);
    expect(result.totalElements).toBe(1);
  });

  it("list passes pagination and date range params (Phase 11)", async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValue(
      new Response(
        JSON.stringify({
          content: [],
          page: 1,
          size: 10,
          totalElements: 0,
          totalPages: 0,
          first: false,
          last: true,
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      )
    );

    await paymentsApi.list({
      from: "2025-02-01",
      to: "2025-02-28",
      page: 1,
      size: 10,
    });

    expect(mockFetch).toHaveBeenCalledWith(
      `${BASE_URL}/v1/payments?from=2025-02-01&to=2025-02-28&page=1&size=10`,
      expect.objectContaining({ method: "GET" })
    );
  });

  it("getById calls GET /v1/payments/:id", async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValue(
      new Response(
        JSON.stringify({
          id: 1,
          orderId: 1,
          amountPaid: 150,
          paymentMethod: "CASH",
          paymentDate: "2025-02-15T10:00:00Z",
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
