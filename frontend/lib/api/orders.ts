/**
 * Orders API module.
 */

import { apiClient } from "./client";
import type { components } from "@/types/api.generated";

export type OrderResponse = components["schemas"]["OrderResponse"] & {
  statusLogs?: OrderStatusLogResponse[];
};
export type OrderPageResponse = components["schemas"]["OrderPageResponse"] & {
  content: OrderResponse[];
};
export type OrderStatusLogResponse = {
  previousStatus: string | null;
  newStatus: string;
  changedAt: string | null;
  notes: string | null;
};
export type OrderTrackingResponse = components["schemas"]["OrderTrackingResponse"];
export type CreateOrderRequest = components["schemas"]["CreateOrderRequest"];
export type UpdateOrderStatusRequest = components["schemas"]["UpdateOrderStatusRequest"];
export type OrderStatus = components["schemas"]["OrderStatus"];

export type OrderListParams = {
  status?: OrderStatus;
  paymentStatus?: components["schemas"]["PaymentStatus"];
  from?: string;
  to?: string;
  page?: number;
  size?: number;
};

export const ordersApi = {
  list: (params?: OrderListParams) =>
    apiClient.get<OrderPageResponse>("/v1/orders", { params }),
  getById: (orderId: number) =>
    apiClient.get<OrderResponse>(`/v1/orders/${orderId}`),
  create: (body: CreateOrderRequest) =>
    apiClient.post<OrderResponse>("/v1/orders", body),
  trackByReference: (referenceNumber: string) =>
    apiClient.get<OrderTrackingResponse>(
      `/v1/orders/reference/${encodeURIComponent(referenceNumber)}`
    ),
  updateStatus: (orderId: number, body: UpdateOrderStatusRequest) =>
    apiClient.patch<OrderResponse>(`/v1/orders/${orderId}/status`, body),
};
