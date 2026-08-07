import { afterEach, describe, expect, it, vi } from "vitest";

const originalTarget = process.env.NEXT_DEPLOYMENT_TARGET;
const originalUpstream = process.env.UPSTREAM_API_URL;

async function loadVercelConfig(upstream?: string) {
  vi.resetModules();
  process.env.NEXT_DEPLOYMENT_TARGET = "vercel";
  if (upstream === undefined) {
    delete process.env.UPSTREAM_API_URL;
  } else {
    process.env.UPSTREAM_API_URL = upstream;
  }
  return (await import("../../next.config.mjs")).default;
}

afterEach(() => {
  vi.resetModules();
  if (originalTarget === undefined) delete process.env.NEXT_DEPLOYMENT_TARGET;
  else process.env.NEXT_DEPLOYMENT_TARGET = originalTarget;
  if (originalUpstream === undefined) delete process.env.UPSTREAM_API_URL;
  else process.env.UPSTREAM_API_URL = originalUpstream;
});

describe("Vercel proxy configuration", () => {
  it("rewrites same-origin API calls to the configured HTTPS upstream", async () => {
    const config = await loadVercelConfig("https://shop.example.ngrok.app/");

    await expect(config.rewrites?.()).resolves.toEqual([
      {
        source: "/api/:path*",
        destination: "https://shop.example.ngrok.app/api/:path*",
      },
    ]);
  });

  it("rejects a missing or non-HTTPS Vercel upstream", async () => {
    await expect(loadVercelConfig()).rejects.toThrow("UPSTREAM_API_URL must be an HTTPS URL");
    await expect(loadVercelConfig("http://shop.example.ngrok.app")).rejects
      .toThrow("UPSTREAM_API_URL must be an HTTPS URL");
  });
});
