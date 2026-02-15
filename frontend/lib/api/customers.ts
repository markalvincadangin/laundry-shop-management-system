/**
 * Customers API module.
 */

import { apiClient } from "./client";
import type { components } from "@/types/api.generated";

export type CustomerResponse = components["schemas"]["CustomerResponse"];
export type CreateCustomerRequest = components["schemas"]["CreateCustomerRequest"];

export const customersApi = {
  list: (query?: string) =>
    apiClient.get<CustomerResponse[]>(
      query ? `/v1/customers?q=${encodeURIComponent(query)}` : "/v1/customers"
    ),
  getById: (customerId: number) =>
    apiClient.get<CustomerResponse>(`/v1/customers/${customerId}`),
  create: (body: CreateCustomerRequest) =>
    apiClient.post<CustomerResponse>("/v1/customers", body),
};
