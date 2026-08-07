import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const deploymentTarget = process.env.NEXT_DEPLOYMENT_TARGET ?? "development";

/** @type {import('next').NextConfig} */
const nextConfig = {
  ...(deploymentTarget === "standalone" ? { output: "export" } : {}),
  images: {
    unoptimized: true,
    dangerouslyAllowSVG: false,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

if (deploymentTarget === "vercel") {
  const upstreamApiUrl = process.env.UPSTREAM_API_URL;
  if (!upstreamApiUrl?.startsWith("https://")) {
    throw new Error("UPSTREAM_API_URL must be an HTTPS URL for Vercel deployments");
  }

  nextConfig.rewrites = async () => [
    {
      source: "/api/:path*",
      destination: `${upstreamApiUrl.replace(/\/$/, "")}/api/:path*`,
    },
  ];
}

export default nextConfig;
