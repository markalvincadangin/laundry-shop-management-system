"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  serviceRatesService, 
  ServiceRateResponse, 
  CreateServiceRateRequest,
  UpdateServiceRateRequest 
} from "@/lib/api/service-rates";
import { toast } from "sonner";
import { UI_LABELS } from "@/constants/ui";

/**
 * useRates: Standardized hook for managing service pricing rates.
 * Follows the system-wide architecture using TanStack Query.
 */
export function useRates() {
  const queryClient = useQueryClient();

  const {
    data: rates = [],
    isLoading: loading,
    isError,
    error,
    refetch: refresh,
  } = useQuery({
    queryKey: ["service-rates"],
    queryFn: () => serviceRatesService.list(false),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateServiceRateRequest) => serviceRatesService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["service-rates"] });
      toast.success(UI_LABELS.feedback.success.SAVED);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || UI_LABELS.feedback.error.GENERIC);
    },
  });

  const updateMutation = useMutation({
    mutationFn: (variables: { id: string; data: UpdateServiceRateRequest }) =>
      serviceRatesService.update(variables.id, variables.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["service-rates"] });
      toast.success(UI_LABELS.feedback.success.SAVED);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || UI_LABELS.feedback.error.GENERIC);
    },
  });

  const createRate = async (data: CreateServiceRateRequest) => {
    return createMutation.mutateAsync(data);
  };

  const updateRate = async (id: string, data: UpdateServiceRateRequest) => {
    return updateMutation.mutateAsync({ id, data });
  };

  return {
    rates,
    loading,
    error: isError ? (error as any).message : null,
    refresh,
    createRate,
    updateRate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
  };
}

