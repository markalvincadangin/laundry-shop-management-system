import { apiClient } from "@/lib/api-client";
import type { components } from "@/types/api.generated";
import { OrderStatus } from "@/constants/order-status";

export type OrderResponse = components["schemas"]["OrderResponse"] & {
  customerName?: string;
  contactNumber?: string;
  basePricePerLoad?: number;
  kgLimitPerLoad?: number;
  pricePerExtraMinute?: number;
  serviceType?: string;
  serviceName?: string;
  notes?: string;
  machineIds?: number[];
  addOns?: components["schemas"]["AddOnResponse"][];
  assignedMachines?: string[];
  isRush?: boolean;
};

export type OrderPageResponse = components["schemas"]["OrderPageResponse"] & {
  content: OrderResponse[];
};

export type OrderListParams = {
  status?: OrderStatus;
  paymentStatus?: components["schemas"]["PaymentStatus"];
  from?: string;
  to?: string;
  page?: number;
  size?: number;
  q?: string;
  customerId?: number;
  serviceRateId?: number;
  sortBy?: string;
  sortDir?: "asc" | "desc";
};

export type OrderPreviewRequest = components["schemas"]["OrderPreviewRequest"] & { isRush?: boolean };
export type OrderPreviewResponse = components["schemas"]["OrderPreviewResponse"];
export type OrderStatsResponse = components["schemas"]["OrderStatsResponse"];
export type UpdateOrderStatusRequest = components["schemas"]["UpdateOrderStatusRequest"] & { machineIds?: number[] };

export interface UpdateOrderRequest {
  extraMinutes?: number;
  addOns?: Array<{ name: string; price: number; quantity: number }>;
  machineIds?: number[];
}

export interface CreateOrderRequest {
  customerId?: number;
  customer?: {
    firstName: string;
    lastName: string;
    contactNumber?: string;
  };
  createdByUserId: string;
  weightKg: number;
  extraMinutes?: number;
  initialAddOns?: Array<{ name: string; price: number; quantity: number }>;
  serviceType?: string;
  notes?: string;
  machineIds?: number[];
  isRush?: boolean;
}

/**
 * Orders Service: Authoritative layer for all order-related API interactions.
 * Mandated by FRONT-002 §8.2.
 */
export const ordersService = {
  /** Retrieves a paginated list of orders with optional filters */
  async list(params?: OrderListParams): Promise<OrderPageResponse> {
    const response = await apiClient.get<OrderPageResponse>("/v1/orders", { params });
    return response;
  },

  /** Retrieves operational statistics for a specific date (defaults to today) */
  async getStats(date?: string): Promise<OrderStatsResponse> {
    const response = await apiClient.get<OrderStatsResponse>("/v1/orders/stats", {
      params: date ? { date } : undefined,
    });
    return response;
  },

  /** Retrieves full details of a specific order by its numeric ID */
  async getById(orderId: number): Promise<OrderResponse> {
    const response = await apiClient.get<OrderResponse>(`/v1/orders/${orderId}`);
    return response;
  },

  /** Creates a new intake record (US-01, US-02) */
  async create(body: CreateOrderRequest): Promise<OrderResponse> {
    const response = await apiClient.post<OrderResponse>("/v1/orders", body);
    return response;
  },

  /** Generates a live price preview based on weight and add-ons (HCI: Immediate Feedback) */
  async preview(body: OrderPreviewRequest): Promise<OrderPreviewResponse> {
    const response = await apiClient.post<OrderPreviewResponse>("/v1/orders/preview", body);
    return response;
  },

  /** Public tracking lookup by reference number (US-04) */
  async trackByReference(referenceNumber: string): Promise<components["schemas"]["OrderTrackingResponse"]> {
    const response = await apiClient.get<components["schemas"]["OrderTrackingResponse"]>(
      `/v1/orders/reference/${encodeURIComponent(referenceNumber)}`
    );
    return response;
  },

  /** Advances an order to the next process stage (US-03, US-05) */
  async updateStatus(orderId: number, body: UpdateOrderStatusRequest): Promise<OrderResponse> {
    const response = await apiClient.patch<OrderResponse>(`/v1/orders/${orderId}/status`, body);
    return response;
  },

  /** Updates non-status order details */
  async update(orderId: number, body: UpdateOrderRequest): Promise<OrderResponse> {
    const response = await apiClient.patch<OrderResponse>(`/v1/orders/${orderId}`, body);
    return response;
  },
};
