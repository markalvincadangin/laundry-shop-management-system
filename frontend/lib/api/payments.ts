/**
 * Payments API module.
 */

import { apiClient } from "./client";
import type { components } from "@/types/api.generated";

export type PaymentResponse = components["schemas"]["PaymentResponse"];
export type CreatePaymentRequest = components["schemas"]["CreatePaymentRequest"];

export const paymentsApi = {
  create: (body: CreatePaymentRequest) =>
    apiClient.post<PaymentResponse>("/v1/payments", body),
  getById: (paymentId: number) =>
    apiClient.get<PaymentResponse>(`/v1/payments/${paymentId}`),
};
