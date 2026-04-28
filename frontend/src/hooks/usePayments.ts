import { useQuery } from "@tanstack/react-query";
import { paymentsService, type PaymentListParams } from "@/services/payments.service";

/**
 * usePayments: Encapsulates payment fetching and caching logic.
 * Part of the Pagination & Caching hardening phase.
 */
export function usePayments(params: PaymentListParams) {
  const {
    data,
    isLoading: loading,
    isError,
    error,
    refetch: refresh,
  } = useQuery({
    queryKey: ["payments", params],
    queryFn: () => paymentsService.list(params),
    placeholderData: (previousData) => previousData,
    staleTime: 30 * 1000, // 30 seconds
  });

  return {
    payments: data?.content ?? [],
    loading,
    error: isError ? (error as any).message : null,
    pagination: {
      page: data?.page ?? 0,
      totalPages: data?.totalPages ?? 0,
      totalElements: data?.totalElements ?? 0,
    },
    refresh,
  };
}
