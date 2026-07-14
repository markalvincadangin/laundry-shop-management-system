"use client";

import { useState } from "react";
import { Power, PowerOff } from "lucide-react";
import { useSystemSettings } from "@/hooks/useSystemSettings";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Tooltip } from "@/components/ui/Tooltip";
import { UI_LABELS } from "@/constants/ui";

export function SystemPauseToggle() {
  const { data: systemSettings, updateSettings, isUpdating } = useSystemSettings();
  const isPaused = systemSettings?.isSystemPaused || false;
  const [isModalOpen, setIsModalOpen] = useState(false);

  const L = UI_LABELS.modules.settings.SYSTEM_PAUSE;

  const handleToggle = () => {
    if (isPaused) {
      // Unpausing is safe, do it immediately
      updateSettings(false);
    } else {
      // Pausing is dangerous, open modal
      setIsModalOpen(true);
    }
  };

  const confirmPause = () => {
    updateSettings(true, {
      onSuccess: () => setIsModalOpen(false)
    });
  };

  return (
    <>
      <Tooltip content={isPaused ? L.TOGGLE_TOOLTIP_PAUSED : L.TOGGLE_TOOLTIP_ACTIVE} position="bottom">
        <div>
          <Button
            variant={isPaused ? "danger" : "secondary"}
            size="md"
            leftIcon={isPaused ? <PowerOff className="h-4 w-4" /> : <Power className="h-4 w-4" />}
            onClick={handleToggle}
            isLoading={isUpdating && !isModalOpen}
            className="hidden xl:inline-flex whitespace-nowrap"
          >
            {isPaused ? L.BTN_PAUSED : L.BTN_ACTIVE}
          </Button>
        </div>
      </Tooltip>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={L.MODAL_TITLE}
        size="md"
      >
        <div className="p-6">
          <p className="text-slate-600 mb-6">{L.MODAL_DESC}</p>
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setIsModalOpen(false)} disabled={isUpdating}>
              {L.MODAL_CANCEL}
            </Button>
            <Button variant="danger" onClick={confirmPause} isLoading={isUpdating}>
              {L.MODAL_CONFIRM}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
