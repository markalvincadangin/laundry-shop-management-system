"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { paymentsService, type CreatePaymentRequest } from "@/lib/api/payments";
import { toast } from "sonner";
import { UI_LABELS } from "@/constants/ui";

/**
 * usePaymentAction: Mutation hook for creating payments.
 * Centralizes settlement logic for both the Payment Page and PaymentActionModal.
 */
export function usePaymentAction() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: CreatePaymentRequest) => paymentsService.create(data),
    onSuccess: (_, variables) => {
      // Invalidate both order and payments cache
      queryClient.invalidateQueries({ queryKey: ["orders", variables.orderId] });
      queryClient.invalidateQueries({ queryKey: ["orders"] }); // For the pipeline
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      queryClient.invalidateQueries({ queryKey: ["order-stats"] });
      
      toast.success(UI_LABELS.feedback.success.PAYMENT || "Payment recorded successfully");
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || UI_LABELS.feedback.error.GENERIC;
      toast.error(message);
    },
  });

  return {
    settlePayment: mutation.mutateAsync,
    isSubmitting: mutation.isPending,
    error: mutation.error,
  };
}

