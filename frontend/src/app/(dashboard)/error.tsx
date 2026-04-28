"use client";

import { ErrorState } from "@/features/shared";

/**
 * Root Dashboard Error Boundary
 * Wraps all dashboard route segments.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <ErrorState error={error} reset={reset} />;
}
