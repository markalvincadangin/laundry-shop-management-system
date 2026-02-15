/**
 * Reports API module.
 */

import { apiClient } from "./client";
import type { components } from "@/types/api.generated";

export type DailySalesReportResponse =
  components["schemas"]["DailySalesReportResponse"];

export const reportsApi = {
  getDailySales: (date: string) =>
    apiClient.get<DailySalesReportResponse>(
      `/v1/reports/sales/daily?date=${encodeURIComponent(date)}`
    ),
};
