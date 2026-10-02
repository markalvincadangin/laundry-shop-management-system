import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const backendOrigin =
  process.env.BACKEND_INTERNAL_URL ||
  process.env.UPSTREAM_API_URL ||
  "http://backend:8080";

const deploymentTarget =
  process.env.NEXT_DEPLOYMENT_TARGET ??
  (process.env.VERCEL === "1" ? "vercel" : process.env.NODE_ENV === "production" ? "standalone" : "development");

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  images: {
    unoptimized: true,
    dangerouslyAllowSVG: false,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

if (deploymentTarget === "vercel") {
  const isPreview = process.env.VERCEL_ENV === "preview";
  const upstreamVariable = isPreview ? "PREVIEW_UPSTREAM_API_URL" : "UPSTREAM_API_URL";
  const upstreamApiUrl = isPreview
    ? process.env.PREVIEW_UPSTREAM_API_URL
    : process.env.UPSTREAM_API_URL;
  if (!upstreamApiUrl?.startsWith("https://")) {
    throw new Error(`${upstreamVariable} must be an HTTPS URL for Vercel deployments`);
  }

  nextConfig.rewrites = async () => [
    {
      source: "/api/:path*",
      destination: `${upstreamApiUrl.replace(/\/$/, "")}/api/:path*`,
    },
  ];
} else if (deploymentTarget === "development") {
  nextConfig.rewrites = async () => [
    {
      source: "/api/:path*",
      destination: `${process.env.BACKEND_INTERNAL_URL || "http://localhost:8080"}/api/:path*`,
    },
  ];
} else {
  // Standalone / Docker container runner mode: proxy internal API requests to backend
  nextConfig.rewrites = async () => [
    {
      source: "/api/:path*",
      destination: `${backendOrigin}/api/:path*`,
    },
  ];
}

export default nextConfig;
