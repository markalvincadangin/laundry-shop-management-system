import { apiClient } from "@/lib/api-client";
import type { components } from "@/types/api.generated";

export type ServiceRateResponse = components["schemas"]["ServiceRateResponse"];
export type CreateServiceRateRequest = components["schemas"]["CreateServiceRateRequest"];
export type UpdateServiceRateRequest = components["schemas"]["UpdateServiceRateRequest"];

export const serviceRatesService = {
  list: (activeOnly = true) =>
    apiClient.get<ServiceRateResponse[]>(
      `/v1/service-rates?activeOnly=${activeOnly}`
    ),
  getActive: () => apiClient.get<ServiceRateResponse>("/v1/service-rates/active"),
  create: (body: CreateServiceRateRequest) =>
    apiClient.post<ServiceRateResponse>("/v1/service-rates", body),
  update: (rateId: number, body: UpdateServiceRateRequest) =>
    apiClient.patch<ServiceRateResponse>(`/v1/service-rates/${rateId}`, body),
};
