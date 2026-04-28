import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { serviceRatesService, ServiceRateResponse, UpdateServiceRateRequest } from "@/services/service-rates.service";
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

  const updateMutation = useMutation({
    mutationFn: (variables: { id: number; data: UpdateServiceRateRequest }) =>
      serviceRatesService.update(variables.id, variables.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["service-rates"] });
      toast.success(UI_LABELS.feedback.success.SAVED);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || UI_LABELS.feedback.error.GENERIC);
    },
  });

  const updateRate = async (id: number, data: UpdateServiceRateRequest) => {
    return updateMutation.mutateAsync({ id, data });
  };

  return {
    rates,
    loading,
    error: isError ? (error as any).message : null,
    refresh,
    updateRate,
    isUpdating: updateMutation.isPending,
  };
}
