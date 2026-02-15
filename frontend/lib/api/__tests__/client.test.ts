/**
 * API client tests for Phase 7 — Frontend Skeleton.
 * Validates: env usage, 2xx parsing, error handling, ErrorResponse mapping, no hardcoded URLs.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { apiClient, ApiError } from "../client";

const BASE_URL = "http://localhost:8080/api";

describe("apiClient", () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_API_URL = BASE_URL;
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("A) Uses NEXT_PUBLIC_API_URL", () => {
    it("throws when NEXT_PUBLIC_API_URL is undefined", async () => {
      delete process.env.NEXT_PUBLIC_API_URL;

      await expect(apiClient.get("/v1/health")).rejects.toThrow(
        "NEXT_PUBLIC_API_URL is not defined"
      );
    });

    it("uses env for base URL (no hardcoded URL)", async () => {
      const mockFetch = vi.mocked(fetch);
      mockFetch.mockResolvedValue(
        new Response(JSON.stringify({ ok: true }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        })
      );

      await apiClient.get<{ ok: boolean }>("/v1/health");

      expect(mockFetch).toHaveBeenCalledWith(
        `${BASE_URL}/v1/health`,
        expect.objectContaining({ method: "GET" })
      );
    });

    it("trims trailing slash from base URL", async () => {
      process.env.NEXT_PUBLIC_API_URL = "http://localhost:8080/api/";
      const mockFetch = vi.mocked(fetch);
      mockFetch.mockResolvedValue(
        new Response("null", {
          status: 200,
          headers: { "Content-Type": "application/json" },
        })
      );

      await apiClient.get("/v1/health");

      expect(mockFetch).toHaveBeenCalledWith(
        "http://localhost:8080/api/v1/health",
        expect.any(Object)
      );
    });
  });

  describe("B) Successful 2xx response parsing", () => {
    it("get returns parsed JSON on 2xx", async () => {
      const mockFetch = vi.mocked(fetch);
      const data = { id: 1, name: "Test" };
      mockFetch.mockResolvedValue(
        new Response(JSON.stringify(data), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        })
      );

      const result = await apiClient.get<{ id: number; name: string }>(
        "/v1/customers/1"
      );

      expect(result).toEqual(data);
    });

    it("post sends JSON body and parses response", async () => {
      const mockFetch = vi.mocked(fetch);
      const requestBody = { firstName: "Juan", lastName: "Dela Cruz" };
      const responseBody = { id: 1, firstName: "Juan", lastName: "Dela Cruz" };
      mockFetch.mockResolvedValue(
        new Response(JSON.stringify(responseBody), {
          status: 201,
          headers: { "Content-Type": "application/json" },
        })
      );

      const result = await apiClient.post<typeof responseBody>(
        "/v1/customers",
        requestBody
      );

      expect(result).toEqual(responseBody);
      expect(mockFetch).toHaveBeenCalledWith(
        `${BASE_URL}/v1/customers`,
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            "Content-Type": "application/json",
            Accept: "application/json",
          }),
          body: JSON.stringify(requestBody),
        })
      );
    });

    it("patch sends JSON body", async () => {
      const mockFetch = vi.mocked(fetch);
      mockFetch.mockResolvedValue(
        new Response(JSON.stringify({ id: 1 }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        })
      );

      await apiClient.patch("/v1/orders/1/status", {
        newStatus: "WASHING",
      });

      expect(mockFetch).toHaveBeenCalledWith(
        `${BASE_URL}/v1/orders/1/status`,
        expect.objectContaining({
          method: "PATCH",
          body: JSON.stringify({ newStatus: "WASHING" }),
        })
      );
    });
  });

  describe("C) Non-2xx error handling", () => {
    it("get throws ApiError on 4xx with ErrorResponse body", async () => {
      const mockFetch = vi.mocked(fetch);
      const errorBody = {
        code: "NOT_FOUND",
        message: "Customer not found: 999",
      };
      mockFetch.mockResolvedValue(
        new Response(JSON.stringify(errorBody), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        })
      );

      let caught: ApiError | null = null;
      try {
        await apiClient.get("/v1/customers/999");
      } catch (err) {
        caught = err as ApiError;
      }
      expect(caught).toBeInstanceOf(ApiError);
      expect(caught!.status).toBe(404);
      expect(caught!.code).toBe("NOT_FOUND");
      expect(caught!.message).toBe("Customer not found: 999");
    });

    it("get throws ApiError on 5xx", async () => {
      const mockFetch = vi.mocked(fetch);
      mockFetch.mockResolvedValue(
        new Response("Internal Server Error", {
          status: 500,
          statusText: "Internal Server Error",
          headers: { "Content-Type": "text/plain" },
        })
      );

      let caught: ApiError | null = null;
      try {
        await apiClient.get("/v1/health");
      } catch (err) {
        caught = err as ApiError;
      }
      expect(caught).toBeInstanceOf(ApiError);
      expect(caught!.status).toBe(500);
      expect(caught!.code).toBe("HTTP_ERROR");
      expect(caught!.message).toBe("Internal Server Error");
    });
  });

  describe("D) ErrorResponse mapping", () => {
    it("maps ErrorResponse code and message to ApiError", async () => {
      const mockFetch = vi.mocked(fetch);
      mockFetch.mockResolvedValue(
        new Response(
          JSON.stringify({
            code: "VALIDATION_ERROR",
            message: "weight_kg must be greater than 0",
            details: { fieldErrors: { weightKg: "must be greater than 0" } },
          }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          }
        )
      );

      try {
        await apiClient.get("/v1/orders");
      } catch (err) {
        const apiErr = err as ApiError;
        expect(apiErr.code).toBe("VALIDATION_ERROR");
        expect(apiErr.message).toBe("weight_kg must be greater than 0");
        expect(apiErr.details).toEqual({
          fieldErrors: { weightKg: "must be greater than 0" },
        });
      }
    });
  });

  describe("E) JSON parsing behavior", () => {
    it("handles 204 no content", async () => {
      const mockFetch = vi.mocked(fetch);
      mockFetch.mockResolvedValue(
        new Response(null, { status: 204, headers: {} })
      );

      const result = await apiClient.get<undefined>("/v1/some-endpoint");

      expect(result).toBeUndefined();
    });

    it("handles non-JSON error response gracefully", async () => {
      const mockFetch = vi.mocked(fetch);
      mockFetch.mockResolvedValue(
        new Response("Gateway Timeout", {
          status: 504,
          statusText: "Gateway Timeout",
          headers: { "Content-Type": "text/plain" },
        })
      );

      let caught: ApiError | null = null;
      try {
        await apiClient.get("/v1/health");
      } catch (err) {
        caught = err as ApiError;
      }
      expect(caught).toBeInstanceOf(ApiError);
      expect(caught!.status).toBe(504);
      expect(caught!.code).toBe("HTTP_ERROR");
      expect(caught!.message).toBe("Gateway Timeout");
    });
  });

  describe("F) ApiError structure", () => {
    it("ApiError has status, code, message, details", () => {
      const err = new ApiError(404, "NOT_FOUND", "Not found", {
        resource: "customer",
      });
      expect(err.status).toBe(404);
      expect(err.code).toBe("NOT_FOUND");
      expect(err.message).toBe("Not found");
      expect(err.details).toEqual({ resource: "customer" });
      expect(err.name).toBe("ApiError");
    });
  });
});
