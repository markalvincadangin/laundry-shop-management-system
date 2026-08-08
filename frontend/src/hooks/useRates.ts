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
    mutationFn: ({ data, operationIdentifier }: { data: CreateServiceRateRequest, operationIdentifier?: string }) => serviceRatesService.create(data, { operationIdentifier }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["service-rates"] });
      toast.success(UI_LABELS.feedback.success.SAVED);
    },
    onError: (err: any) => {
      if (err.name === "UnconfirmedOperationError") {
        toast.error("Network timeout. The rate may have been saved. Please check or retry.", { duration: 10000 });
      } else {
        toast.error(err.response?.data?.message || UI_LABELS.feedback.error.GENERIC);
      }
    },
  });

  const updateMutation = useMutation({
    mutationFn: (variables: { id: string; data: UpdateServiceRateRequest, operationIdentifier?: string }) =>
      serviceRatesService.update(variables.id, variables.data, { operationIdentifier: variables.operationIdentifier }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["service-rates"] });
      toast.success(UI_LABELS.feedback.success.SAVED);
    },
    onError: (err: any) => {
      if (err.name === "UnconfirmedOperationError") {
        toast.error("Network timeout. The rate may have been saved. Please check or retry.", { duration: 10000 });
      } else {
        toast.error(err.response?.data?.message || UI_LABELS.feedback.error.GENERIC);
      }
    },
  });

  const createRate = async (data: CreateServiceRateRequest, operationIdentifier?: string) => {
    return createMutation.mutateAsync({ data, operationIdentifier });
  };

  const updateRate = async (id: string, data: UpdateServiceRateRequest, operationIdentifier?: string) => {
    return updateMutation.mutateAsync({ id, data, operationIdentifier });
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

