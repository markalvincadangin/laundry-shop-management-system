/**
 * Payments API module.
 */

import { apiClient } from "./client";
import type { components } from "@/types/api.generated";

export type PaymentResponse = components["schemas"]["PaymentResponse"];
export type PaymentPageResponse = components["schemas"]["PaymentPageResponse"];
export type CreatePaymentRequest = components["schemas"]["CreatePaymentRequest"];

export type PaymentListParams = {
  orderId?: number;
  from?: string;
  to?: string;
  page?: number;
  size?: number;
};

export const paymentsApi = {
  list: (params?: PaymentListParams) =>
    apiClient.get<PaymentPageResponse>("/v1/payments", { params }),
  create: (body: CreatePaymentRequest) =>
    apiClient.post<PaymentResponse>("/v1/payments", body),
  getById: (paymentId: number) =>
    apiClient.get<PaymentResponse>(`/v1/payments/${paymentId}`),
};
