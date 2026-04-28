import { apiClient } from "@/lib/api-client";
import type { components } from "@/types/api.generated";

export type DailySalesReportResponse = components["schemas"]["DailySalesReportResponse"];
export type PeriodSalesReportResponse = components["schemas"]["PeriodSalesReportResponse"];

/**
 * reportsService: Authoritative layer for business insight and financial reporting.
 * Mandated by FRONT-002 §8.2.
 */
export const reportsService = {
  /** Retrieves sales data for a specific date */
  async getDailySales(date: string): Promise<DailySalesReportResponse> {
    const response = await apiClient.get<DailySalesReportResponse>(
      `/v1/reports/sales/daily`,
      { params: { date } }
    );
    return response;
  },

  /** Retrieves monthly sales report (US-09) */
  async getMonthlySales(year: number, month: number): Promise<PeriodSalesReportResponse> {
    const response = await apiClient.get<PeriodSalesReportResponse>(
      `/v1/reports/sales/monthly`,
      { params: { year, month } }
    );
    return response;
  },

  /** Retrieves yearly sales report (US-09) */
  async getYearlySales(year: number): Promise<PeriodSalesReportResponse> {
    const response = await apiClient.get<PeriodSalesReportResponse>(
      `/v1/reports/sales/yearly`,
      { params: { year } }
    );
    return response;
  },
};
