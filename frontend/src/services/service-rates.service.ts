import { apiClient } from "@/lib/api-client";
import type { components } from "@/types/api.generated";

export type ServiceRateResponse = components["schemas"]["ServiceRateResponse"];
export type UpdateServiceRateRequest = components["schemas"]["UpdateServiceRateRequest"];

export const serviceRatesService = {
  list: (activeOnly = true) =>
    apiClient.get<ServiceRateResponse[]>(
      `/v1/service-rates?activeOnly=${activeOnly}`
    ),
  getActive: () => apiClient.get<ServiceRateResponse>("/v1/service-rates/active"),
  update: (rateId: number, body: UpdateServiceRateRequest) =>
    apiClient.patch<ServiceRateResponse>(`/v1/service-rates/${rateId}`, body),
};
