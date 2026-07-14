"use client";

import { AlertTriangle } from "lucide-react";
import { useSystemSettings } from "@/hooks/useSystemSettings";
import { UI_LABELS } from "@/constants/ui";
import { Button } from "@/components/ui/Button";

export function SystemPauseBanner() {
  const { data: systemSettings, updateSettings, isUpdating } = useSystemSettings();
  const isSystemPaused = systemSettings?.isSystemPaused || false;

  const L = UI_LABELS.modules.settings.SYSTEM_PAUSE;

  if (!isSystemPaused) return null;

  return (
    <div className="bg-red-500/10 border-b border-red-500/20 px-4 py-3 sm:px-5 lg:px-6 z-10 sticky top-[64px] backdrop-blur-md shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 max-w-[1600px] mx-auto">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center">
            <AlertTriangle className="w-4 h-4 text-red-600 animate-pulse" />
          </div>
          <div>
            <h4 className="text-red-800 font-bold text-sm">
              {L.BANNER_TITLE}
            </h4>
            <p className="text-red-700 font-medium text-sm mt-0.5">
              {L.BANNER_DESC}
            </p>
          </div>
        </div>
        
        <div className="flex-shrink-0">
          <Button 
            variant="primary" 
            size="sm" 
            onClick={() => updateSettings(false)}
            isLoading={isUpdating}
            className="bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-600/20 border-0"
          >
            {L.RESUME_BTN}
          </Button>
        </div>
      </div>
    </div>
  );
}
