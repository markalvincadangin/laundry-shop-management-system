import { useState, useEffect, useCallback } from "react";
import { ordersService, OrderPreviewResponse } from "@/services/orders.service";
import type { components } from "@/types/api.generated";

type AddOnInput = components["schemas"]["AddOnInput"];

interface UsePriceCalculationProps {
  weightKg: string;
  extraMinutes: string;
  addOns: AddOnInput[];
  debounceMs?: number;
}

/**
 * usePriceCalculation: The single source of truth for pricing logic.
 * Mandated by FRONT-001 §8.3 and FRONT-002 §8.1.
 */
export function usePriceCalculation({
  weightKg,
  extraMinutes,
  addOns,
  debounceMs = 300
}: UsePriceCalculationProps) {
  const [preview, setPreview] = useState<OrderPreviewResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPreview = useCallback(async () => {
    const weight = parseFloat(weightKg);
    
    if (isNaN(weight) || weight <= 0) {
      setPreview(null);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await ordersService.preview({
        weightKg: weight,
        extraMinutes: parseInt(extraMinutes, 10) || 0,
        initialAddOns: addOns.length > 0 ? addOns : undefined,
      });
      setPreview(res);
    } catch (err) {
      setPreview(null);
      setError("Calculation failed. Please verify weight.");
    } finally {
      setLoading(false);
    }
  }, [weightKg, extraMinutes, addOns]);

  useEffect(() => {
    const timer = setTimeout(fetchPreview, debounceMs);
    return () => clearTimeout(timer);
  }, [fetchPreview, debounceMs]);

  return { preview, loading, error, refetch: fetchPreview };
}
