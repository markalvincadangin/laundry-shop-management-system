"use client";

import { useState, useEffect } from "react";

const FALLBACK_PORTAL_URL = "https://laundry-shop-management-system.vercel.app";

/**
 * Fetches the configured customer portal URL from the backend at runtime.
 *
 * The backend exposes GET /api/v1/app-config which returns:
 *   { "portalUrl": "https://laundry-shop-management-system.vercel.app" }
 *
 * On Windows installer deployments, this value comes from the "Remote Frontend
 * URL" wizard input (RemoteFrontendUrl in installer.iss), which the shop owner
 * sets to the Vercel URL or custom domain of their customer-facing portal.
 *
 * Falls back to the Vercel URL if the backend is unreachable or returns no value.
 */
export function usePortalUrl(): string {
  const [portalUrl, setPortalUrl] = useState<string>(FALLBACK_PORTAL_URL);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/v1/app-config", { credentials: "omit" })
      .then((res) => res.json())
      .then((data: { portalUrl?: string }) => {
        if (!cancelled && data.portalUrl && data.portalUrl.startsWith("http")) {
          setPortalUrl(data.portalUrl);
        }
      })
      .catch(() => {
        // Backend unreachable — keep Vercel fallback
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return portalUrl;
}
