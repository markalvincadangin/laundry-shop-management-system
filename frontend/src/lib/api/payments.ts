import { apiClient } from "@/lib/api-client";
import type { components } from "@/types/api.generated";

export type PaymentResponse = components["schemas"]["PaymentResponse"];
export type PaymentPageResponse = components["schemas"]["PaymentPageResponse"];
export type CreatePaymentRequest = components["schemas"]["CreatePaymentRequest"];

export type PaymentListParams = {
  orderId?: number;
  from?: string;
  to?: string;
  q?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: "asc" | "desc";
};

/**
 * paymentsService: The authority for payment-related operations.
 * Institutionalized by FRONT-002 §8.2 for Modular Logic.
 */
export const paymentsService = {
  /**
   * Retrieves a paginated list of payments with optional filters.
   */
  async list(params?: PaymentListParams): Promise<PaymentPageResponse> {
    const response = await apiClient.get<PaymentPageResponse>("/v1/payments", { params });
    return response;
  },

  /**
   * Records a new payment settlement for an order.
   */
  async create(body: CreatePaymentRequest): Promise<PaymentResponse> {
    const response = await apiClient.post<PaymentResponse>("/v1/payments", body);
    return response;
  },

  async getById(paymentId: number): Promise<PaymentResponse> {
    const response = await apiClient.get<PaymentResponse>(`/v1/payments/${paymentId}`);
    return response;
  },

  /**
   * Voids an existing payment and reverts order status.
   */
  async voidPayment(orderId: number): Promise<void> {
    await apiClient.post(`/v1/payments/order/${orderId}/void`);
  },
};
