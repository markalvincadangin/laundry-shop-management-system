import { UI_LABELS } from "./ui";
import { Waves } from "lucide-react";

/**
 * SERVICE_TYPES: Canonical service definitions for the Faith Laundry Shop.
 * As per audit finding #7, the business primarily offers Wash, Dry, and Fold.
 */
export const SERVICE_TYPES = {
  WASH_DRY_FOLD: {
    label: UI_LABELS.services.WASH_DRY_FOLD,
    value: "WASH_DRY_FOLD",
    description: UI_LABELS.services.WASH_DRY_FOLD_DESC,
    icon: Waves,
    pricePerLoad: 120,
    maxKgPerLoad: 8,
  },
} as const;

export type ServiceType = keyof typeof SERVICE_TYPES;
export type ServiceDefinition = typeof SERVICE_TYPES[ServiceType];

