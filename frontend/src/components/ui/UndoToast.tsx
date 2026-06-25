"use client";

import * as React from "react";
import { toast } from "sonner";
import { RotateCcw } from "lucide-react";

import { UndoToastProps } from "@/types/components";

/**
 * UndoToast provides a temporal recovery mechanism for HCI-compliant workflows.
 * It displays a success message with an 'Undo' button that triggers the rollback logic.
 */
export function showUndoToast({ message, onUndo, duration = 5000 }: UndoToastProps) {
  toast.success(message, {
    duration,
    action: {
      label: "Undo",
      onClick: () => {
        onUndo();
        toast.info("Action reversed successfully.");
      },
    },
    icon: <RotateCcw className="h-4 w-4" />,
  });
}
