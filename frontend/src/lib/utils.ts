import { UI_LABELS } from "@/constants/ui";

/**
 * Formats a number as Philippine Peso currency.
 * Example: 120 -> ₱120.00
 */
export const formatCurrency = (amount: number | undefined | null): string => {
  const value = amount ?? 0;
  return `${UI_LABELS.units.PRICE_SYMBOL}${value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

export const formatDate = (date: string | Date | undefined | null): string => {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

/**
 * Formats a date string or object into a human-readable date and time.
 * Example: "2024-04-24T08:00:00Z" -> "Apr 24, 2024 • 8:00 AM"
 */
export const formatDateTime = (date: string | Date | undefined | null): string => {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  return `${formatDate(d)} • ${formatTime(d)}`;
};

/**
 * Formats a date string or object into a human-readable time.
 * Example: "2024-04-24T08:00:00Z" -> "8:00 AM"
 */
export const formatTime = (date: string | Date | undefined | null): string => {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

/**
 * Formats a date into a relative time string (e.g., "5m ago", "just now").
 * Falls back to toLocaleDateString() for dates older than 24 hours.
 */
export const formatRelativeTime = (date: string | Date | undefined | null): string => {
  if (!date) return "just now";
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000);
  
  if (diffInSeconds < 60) return "just now";
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
};

/**
 * Formats a weight value with the canonical unit.
 * Example: 8.5 -> 8.5kg
 */
export const formatWeight = (weight: number | undefined | null): string => {
  if (weight === undefined || weight === null) return `0${UI_LABELS.units.WEIGHT}`;
  return `${weight}${UI_LABELS.units.WEIGHT}`;
};
/**
 * Calculates estimated completion time based on loads and extra minutes.
 * Standard cycle is 45 mins per load as per BR-PR-02.
 */
export const calculateEstimatedTime = (totalLoads: number = 0, extraMinutes: number = 0): string => {
  const total = (totalLoads * 45) + extraMinutes;
  if (total <= 0) return "—";
  if (total < 60) return `${total} mins`;
  const hrs = Math.floor(total / 60);
  const mins = total % 60;
  return mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`;
};

/**
 * Next.js App Router Static Export workaround for dynamic routes.
 * When the page is hydrated from a statically exported fallback.html, 
 * useParams() will always return the fallback value (e.g., 'fallback').
 * This utility resolves the actual ID from the URL pathname.
 */
export function useResolvedId(paramsId: string | string[], routePrefix: string): string {
  const [id, setId] = require("react").useState(String(paramsId));

  require("react").useEffect(() => {
    if (id === "fallback" || id === "%5Bid%5D" || id === "[id]") {
      try {
        const match = window.location.pathname.match(new RegExp(`^${routePrefix}/([^/?]+)`));
        if (match) {
          setId(match[1]);
        }
      } catch (e) {
        // ignore
      }
    }
  }, [id, routePrefix]);

  return id;
}
