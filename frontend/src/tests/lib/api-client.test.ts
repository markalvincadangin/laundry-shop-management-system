import { describe, expect, it } from "vitest";
import * as apiClientModule from "@/lib/api-client";

type ApiBaseResolver = (input: {
  nodeEnv: "development" | "production";
  apiUrl?: string;
}) => string;

const resolveApiBaseUrl = (apiClientModule as unknown as {
  resolveApiBaseUrl?: ApiBaseResolver;
}).resolveApiBaseUrl;

describe("resolveApiBaseUrl", () => {
  it("uses the configured local backend URL during development", () => {
    expect(resolveApiBaseUrl).toBeTypeOf("function");
    expect(resolveApiBaseUrl?.({
      nodeEnv: "development",
      apiUrl: "http://localhost:8080/api",
    })).toBe("http://localhost:8080/api");
  });

  it("uses the same relative API base for standalone production", () => {
    expect(resolveApiBaseUrl).toBeTypeOf("function");
    expect(resolveApiBaseUrl?.({ nodeEnv: "production", apiUrl: "/api" })).toBe("/api");
  });

  it("uses the same relative API base for Vercel production", () => {
    expect(resolveApiBaseUrl).toBeTypeOf("function");
    expect(resolveApiBaseUrl?.({ nodeEnv: "production", apiUrl: "/api/" })).toBe("/api");
  });
});
