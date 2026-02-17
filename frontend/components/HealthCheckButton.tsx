"use client";

import { useState } from "react";
import { checkHealth } from "@/lib/api/health";

export function HealthCheckButton() {
  const [status, setStatus] = useState<"idle" | "checking" | "ok" | "error">("idle");
  const [errorDetail, setErrorDetail] = useState<string | null>(null);

  const handleCheck = async () => {
    setStatus("checking");
    setErrorDetail(null);
    try {
      const result = await checkHealth();
      setStatus(result.ok ? "ok" : "error");
      if (!result.ok && result.error) setErrorDetail(result.error);
    } catch (err) {
      setStatus("error");
      setErrorDetail(err instanceof Error ? err.message : "Unknown error");
    }
  };

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleCheck}
        disabled={status === "checking"}
        className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {status === "checking" ? "Checking..." : "Check API"}
      </button>
      {status === "ok" && (
        <p className="text-sm text-green-600">API reachable</p>
      )}
      {status === "error" && (
        <div className="text-sm text-red-600">
          <p>API unreachable (start backend?)</p>
          {errorDetail && <p className="mt-1 text-xs text-red-500">{errorDetail}</p>}
        </div>
      )}
    </div>
  );
}
