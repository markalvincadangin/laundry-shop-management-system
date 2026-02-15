/**
 * Phase 8 — Customers API module tests.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { customersApi } from "../customers";

const BASE_URL = "http://localhost:8080/api";

describe("customersApi", () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_API_URL = BASE_URL;
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("list without query calls GET /v1/customers", async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValue(
      new Response(JSON.stringify([]), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    );

    await customersApi.list();

    expect(mockFetch).toHaveBeenCalledWith(
      `${BASE_URL}/v1/customers`,
      expect.objectContaining({ method: "GET" })
    );
  });

  it("list with query adds q param", async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValue(
      new Response(JSON.stringify([]), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    );

    await customersApi.list("Juan");

    expect(mockFetch).toHaveBeenCalledWith(
      `${BASE_URL}/v1/customers?q=Juan`,
      expect.objectContaining({ method: "GET" })
    );
  });

  it("create sends POST with CreateCustomerRequest body", async () => {
    const mockFetch = vi.mocked(fetch);
    const body = {
      firstName: "Juan",
      lastName: "Dela Cruz",
      contactNumber: "09171234567",
    };
    mockFetch.mockResolvedValue(
      new Response(
        JSON.stringify({
          id: 1,
          firstName: "Juan",
          lastName: "Dela Cruz",
          contactNumber: "09171234567",
        }),
        { status: 201, headers: { "Content-Type": "application/json" } }
      )
    );

    const result = await customersApi.create(body);

    expect(mockFetch).toHaveBeenCalledWith(
      `${BASE_URL}/v1/customers`,
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify(body),
      })
    );
    expect(result.firstName).toBe("Juan");
  });
});
