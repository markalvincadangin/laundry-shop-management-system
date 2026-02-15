/**
 * Service rates API module (for add-on options, etc.).
 */

import { apiClient } from "./client";
import type { components } from "@/types/api.generated";

export type ServiceRateResponse = components["schemas"]["ServiceRateResponse"];

export const serviceRatesApi = {
  list: (activeOnly = true) =>
    apiClient.get<ServiceRateResponse[]>(
      `/v1/service-rates?activeOnly=${activeOnly}`
    ),
  getActive: () => apiClient.get<ServiceRateResponse>("/v1/service-rates/active"),
};
