"use client";

import { UI_LABELS } from "@/constants/ui";

export function AvailabilityBanner() {
  return (
    <aside role="status" className="bg-amber-100 px-4 py-3 text-center text-amber-950">
      <strong>{UI_LABELS.remoteAccess.STALE_TITLE}</strong>
      <span className="ml-2">{UI_LABELS.remoteAccess.STALE_DESCRIPTION}</span>
    </aside>
  );
}
