/**
 * Phase 9 — Auth API module tests.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { authApi } from "../auth";

const BASE_URL = "http://localhost:8080/api";

describe("authApi", () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_API_URL = BASE_URL;
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("login sends POST with username and password", async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValue(
      new Response(
        JSON.stringify({ token: "jwt-token", role: "OWNER" }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      )
    );

    const result = await authApi.login({
      username: "owner",
      password: "owner123",
    });

    expect(mockFetch).toHaveBeenCalledWith(
      `${BASE_URL}/v1/auth/login`,
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ username: "owner", password: "owner123" }),
        credentials: "include",
      })
    );
    expect(result.token).toBe("jwt-token");
    expect(result.role).toBe("OWNER");
  });

  it("logout sends POST to /v1/auth/logout", async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValue(
      new Response(null, { status: 200, headers: {} })
    );

    await authApi.logout();

    expect(mockFetch).toHaveBeenCalledWith(
      `${BASE_URL}/v1/auth/logout`,
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({}),
        credentials: "include",
      })
    );
  });

  it("me calls GET /v1/auth/me", async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValue(
      new Response(
        JSON.stringify({
          userId: "uuid-1",
          username: "owner",
          role: "OWNER",
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      )
    );

    const result = await authApi.me();

    expect(mockFetch).toHaveBeenCalledWith(
      `${BASE_URL}/v1/auth/me`,
      expect.objectContaining({ method: "GET", credentials: "include" })
    );
    expect(result.userId).toBe("uuid-1");
    expect(result.username).toBe("owner");
    expect(result.role).toBe("OWNER");
  });
});
