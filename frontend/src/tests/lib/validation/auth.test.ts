import { describe, it, expect } from "vitest";
import { LoginSchema, AuthResponseSchema } from "@/lib/validation/auth";

describe("LoginSchema", () => {
  it("should validate correct login input", () => {
    const result = LoginSchema.safeParse({
      username: "admin",
      password: "password123",
    });
    expect(result.success).toBe(true);
  });

  it("should reject empty username", () => {
    const result = LoginSchema.safeParse({
      username: "",
      password: "password123",
    });
    expect(result.success).toBe(false);
  });

  it("should reject password less than 6 characters", () => {
    const result = LoginSchema.safeParse({
      username: "admin",
      password: "123",
    });
    expect(result.success).toBe(false);
  });
});

describe("AuthResponseSchema", () => {
  it("should validate valid auth response payload", () => {
    const result = AuthResponseSchema.safeParse({
      accessToken: "mock-jwt-token",
      expiresIn: 86400,
    });
    expect(result.success).toBe(true);
  });
});
