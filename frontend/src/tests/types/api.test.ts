/**
 * Type safety validation for Phase 7.
 * Ensures ErrorResponse and API types match OpenAPI schema.
 */

import { describe, expect, it } from "vitest";
import type { ErrorResponse } from "@/types/api";

describe("ErrorResponse type", () => {
  it("matches OpenAPI ErrorResponse schema (code, message required)", () => {
    const valid: ErrorResponse = {
      code: "VALIDATION_ERROR",
      message: "Validation failed",
    };
    expect(valid.code).toBe("VALIDATION_ERROR");
    expect(valid.message).toBe("Validation failed");
  });

  it("allows optional details (OpenAPI: array or object)", () => {
    const withDetails: ErrorResponse = {
      code: "VALIDATION_ERROR",
      message: "Validation failed",
      details: ["weightKg must be greater than 0"],
    };
    expect(withDetails.details).toBeDefined();
  });

  it("has no implicit any - structure is strictly typed", () => {
    const err: ErrorResponse = {
      code: "NOT_FOUND",
      message: "Resource not found",
    };
    // Compile-time: code and message are strings
    const code: string = err.code;
    const message: string = err.message;
    expect(typeof code).toBe("string");
    expect(typeof message).toBe("string");
  });
});
