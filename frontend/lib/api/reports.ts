/**
 * Reports API module.
 */

import { apiClient } from "./client";
import type { components } from "@/types/api.generated";

export type DailySalesReportResponse =
  components["schemas"]["DailySalesReportResponse"];
export type PeriodSalesReportResponse =
  components["schemas"]["PeriodSalesReportResponse"];

export const reportsApi = {
  getDailySales: (date: string) =>
    apiClient.get<DailySalesReportResponse>(
      `/v1/reports/sales/daily?date=${encodeURIComponent(date)}`
    ),
  // Future implementation: Monthly sales report (US-09)
  getMonthlySales: (year: number, month: number) =>
    apiClient.get<PeriodSalesReportResponse>(
      `/v1/reports/sales/monthly?year=${year}&month=${month}`
    ),
  // Future implementation: Yearly sales report (US-09)
  getYearlySales: (year: number) =>
    apiClient.get<PeriodSalesReportResponse>(
      `/v1/reports/sales/yearly?year=${year}`
    ),
};
