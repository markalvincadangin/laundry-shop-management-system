import { UI_LABELS } from "./ui";
import { Package, Zap, Wind } from "lucide-react";

/**
 * SERVICE_TYPES: Canonical service definitions for the Faith Laundry Shop.
 * As per audit finding #7, the business primarily offers Wash, Dry, and Fold.
 */
export const SERVICE_TYPES = {
  WASH_DRY_FOLD: {
    label: UI_LABELS.services.WASH_DRY_FOLD,
    value: "WASH_DRY_FOLD",
    description: UI_LABELS.services.WASH_DRY_FOLD_DESC,
    icon: Package,
    pricePerLoad: 140,
    maxKgPerLoad: 8,
  },
  WASH_DRY_FOLD_RUSH: {
    label: UI_LABELS.services.WASH_DRY_FOLD_RUSH,
    value: "WASH_DRY_FOLD_RUSH",
    description: UI_LABELS.services.WASH_DRY_FOLD_RUSH_DESC,
    icon: Zap,
    pricePerLoad: 160,
    maxKgPerLoad: 8,
  },
  BLANKETS: {
    label: UI_LABELS.services.BLANKETS,
    value: "BLANKETS",
    description: UI_LABELS.services.BLANKETS_DESC,
    icon: Wind,
    pricePerLoad: 200,
    maxKgPerLoad: 8,
  },
} as const;

export type ServiceType = keyof typeof SERVICE_TYPES;
export type ServiceDefinition = typeof SERVICE_TYPES[ServiceType];

