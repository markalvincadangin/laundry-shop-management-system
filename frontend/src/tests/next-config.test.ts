import { afterEach, describe, expect, it, vi } from "vitest";

const originalTarget = process.env.NEXT_DEPLOYMENT_TARGET;
const originalUpstream = process.env.UPSTREAM_API_URL;
const originalPreviewUpstream = process.env.PREVIEW_UPSTREAM_API_URL;
const originalVercelEnvironment = process.env.VERCEL_ENV;

async function loadVercelConfig(upstream?: string, previewUpstream?: string, vercelEnvironment = "production") {
  vi.resetModules();
  process.env.NEXT_DEPLOYMENT_TARGET = "vercel";
  process.env.VERCEL_ENV = vercelEnvironment;
  if (upstream === undefined) {
    delete process.env.UPSTREAM_API_URL;
  } else {
    process.env.UPSTREAM_API_URL = upstream;
  }
  if (previewUpstream === undefined) delete process.env.PREVIEW_UPSTREAM_API_URL;
  else process.env.PREVIEW_UPSTREAM_API_URL = previewUpstream;
  return (await import("../../next.config.mjs")).default;
}

afterEach(() => {
  vi.resetModules();
  if (originalTarget === undefined) delete process.env.NEXT_DEPLOYMENT_TARGET;
  else process.env.NEXT_DEPLOYMENT_TARGET = originalTarget;
  if (originalUpstream === undefined) delete process.env.UPSTREAM_API_URL;
  else process.env.UPSTREAM_API_URL = originalUpstream;
  if (originalPreviewUpstream === undefined) delete process.env.PREVIEW_UPSTREAM_API_URL;
  else process.env.PREVIEW_UPSTREAM_API_URL = originalPreviewUpstream;
  if (originalVercelEnvironment === undefined) delete process.env.VERCEL_ENV;
  else process.env.VERCEL_ENV = originalVercelEnvironment;
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

  it("requires a separately scoped preview upstream", async () => {
    await expect(loadVercelConfig("https://production.example.ngrok.app", undefined, "preview"))
      .rejects.toThrow("PREVIEW_UPSTREAM_API_URL must be an HTTPS URL");

    const config = await loadVercelConfig(
      "https://production.example.ngrok.app",
      "https://preview.example.ngrok.app",
      "preview",
    );
    await expect(config.rewrites?.()).resolves.toEqual([{
      source: "/api/:path*",
      destination: "https://preview.example.ngrok.app/api/:path*",
    }]);
  });
});
