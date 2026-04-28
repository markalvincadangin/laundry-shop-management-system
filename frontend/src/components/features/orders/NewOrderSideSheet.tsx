"use client";

import React from "react";
import { SideSheet } from "@/components/ui/SideSheet";
import { OrderIntakeForm } from "./OrderIntakeForm";
import { UI_LABELS } from "@/constants/ui";

interface NewOrderSideSheetProps {
  isOpen: boolean;
  onClose: () => void;
  staffUserId: string | null;
  onSuccess?: () => void;
}

/**
 * NewOrderSideSheet
 * Wraps the OrderIntakeForm in a Drawer to allow rapid data entry
 * without leaving the Command Center context.
 */
export function NewOrderSideSheet({
  isOpen,
  onClose,
  staffUserId,
  onSuccess,
}: NewOrderSideSheetProps) {
  return (
    <SideSheet
      isOpen={isOpen}
      onClose={onClose}
      title={UI_LABELS.forms.intake.TITLE}
      width="max-w-[800px]"
    >
      <div className="p-6">
        <OrderIntakeForm 
          staffUserId={staffUserId} 
          onSuccess={() => {
            onSuccess?.();
            onClose();
          }}
          isModal={true}
        />
      </div>
    </SideSheet>
  );
}
