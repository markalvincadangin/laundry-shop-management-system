import { describe, expect, it, vi } from "vitest";
import {
  AVAILABILITY_PROBE_TIMEOUT_MS,
  probeRemoteAvailability,
} from "@/lib/availability";

describe("probeRemoteAvailability", () => {
  it("reports online after the health endpoint succeeds", async () => {
    const fetcher = vi.fn().mockResolvedValue(new Response(null, { status: 204 }));

    await expect(probeRemoteAvailability(fetcher)).resolves.toBe("online");
    expect(fetcher).toHaveBeenCalledWith("/api/v1/health", expect.objectContaining({
      cache: "no-store",
      signal: expect.any(AbortSignal),
    }));
  });

  it("reports offline when the health endpoint rejects or returns an error", async () => {
    await expect(probeRemoteAvailability(vi.fn().mockRejectedValue(new TypeError("Network error"))))
      .resolves.toBe("offline");
    await expect(probeRemoteAvailability(vi.fn().mockResolvedValue(new Response(null, { status: 503 }))))
      .resolves.toBe("offline");
  });

  it("uses a five-second deadline when the health probe does not settle", async () => {
    vi.useFakeTimers();
    const fetcher = vi.fn().mockImplementation((_: string, init: RequestInit) => new Promise((_, reject) => {
      init.signal?.addEventListener("abort", () => reject(new DOMException("Aborted", "AbortError")));
    }));

    const result = probeRemoteAvailability(fetcher);
    await vi.advanceTimersByTimeAsync(AVAILABILITY_PROBE_TIMEOUT_MS);

    await expect(result).resolves.toBe("offline");
    vi.useRealTimers();
  });
});
