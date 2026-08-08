export const AVAILABILITY_PROBE_TIMEOUT_MS = 5_000;

export type AvailabilityState = "checking" | "online" | "offline";
export type AvailabilityProbe = () => Promise<Exclude<AvailabilityState, "checking">>;

let remoteWritesEnabled = true;

export class RemoteServiceUnavailableError extends Error {
  constructor() {
    super("The shop system is currently offline. Please reconnect before making changes.");
    this.name = "RemoteServiceUnavailableError";
  }
}

export function setRemoteWritesEnabled(enabled: boolean) {
  remoteWritesEnabled = enabled;
}

export function requireRemoteWritesEnabled() {
  if (!remoteWritesEnabled) {
    throw new RemoteServiceUnavailableError();
  }
}

/**
 * Checks the same-origin health endpoint without allowing a cached response to
 * make an unavailable shop host look available.
 */
export async function probeRemoteAvailability(
  fetcher: typeof fetch = fetch,
): Promise<Exclude<AvailabilityState, "checking">> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), AVAILABILITY_PROBE_TIMEOUT_MS);

  try {
    const response = await fetcher("/api/v1/health", {
      cache: "no-store",
      signal: controller.signal,
    });
    return response.ok ? "online" : "offline";
  } catch {
    return "offline";
  } finally {
    window.clearTimeout(timeout);
  }
}
