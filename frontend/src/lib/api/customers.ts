import { apiClient } from "@/lib/api-client";
import type { components } from "@/types/api.generated";

export type CustomerResponse = components["schemas"]["CustomerResponse"];
export type CreateCustomerRequest = components["schemas"]["CreateCustomerRequest"];

export type CustomerPageResponse = components["schemas"]["CustomerPageResponse"];

export type CustomerListParams = {
  q?: string;
  from?: string;
  to?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: "asc" | "desc";
  isActive?: boolean;
};

/**
 * Customers Service: Authoritative layer for all customer-related API interactions.
 * Mandated by FRONT-002 §8.2.
 */
export const customersService = {
  /** Retrieves a list of customers with optional search and pagination */
  async list(params?: CustomerListParams): Promise<CustomerPageResponse> {
    const response = await apiClient.get<CustomerPageResponse>("/v1/customers", {
      params,
    });
    return response;
  },

  /** Retrieves full details of a specific customer by ID */
  async getById(customerId: number): Promise<CustomerResponse> {
    const response = await apiClient.get<CustomerResponse>(`/v1/customers/${customerId}`);
    return response;
  },

  /** Creates a new customer record (US-01) */
  async create(body: CreateCustomerRequest): Promise<CustomerResponse> {
    const response = await apiClient.post<CustomerResponse>("/v1/customers", body);
    return response;
  },

  /** Updates an existing customer record */
  async update(customerId: number, body: Partial<CreateCustomerRequest>): Promise<CustomerResponse> {
    const response = await apiClient.patch<CustomerResponse>(`/v1/customers/${customerId}`, body);
    return response;
  },

  /** Toggles the active status of a customer account */
  async toggleActive(customerId: number): Promise<CustomerResponse> {
    const response = await apiClient.patch<CustomerResponse>(`/v1/customers/${customerId}/toggle-active`);
    return response;
  },
};
