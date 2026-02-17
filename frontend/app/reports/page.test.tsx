/**
 * Phase 8 — Reports page tests.
 * Phase 12 — ChartSkeleton, CardSkeleton.
 */

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { reportsApi } from "@/lib/api/reports";
import ReportsPage from "./page";

vi.mock("@/lib/api/reports", () => ({
  reportsApi: {
    getDailySales: vi.fn(),
    getMonthlySales: vi.fn(),
    getYearlySales: vi.fn(),
  },
}));

const defaultReport = {
  date: "2025-02-15",
  totalIncome: 1500,
  paidOrdersCount: 5,
};

describe("ReportsPage", () => {
  it("renders heading and date picker", async () => {
    vi.mocked(reportsApi.getDailySales).mockResolvedValue(defaultReport);

    render(<ReportsPage />);

    expect(screen.getByRole("heading", { name: /sales reports/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/^date$/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /daily/i })).toBeInTheDocument();
  });

  it("fetches report on mount and displays data", async () => {
    vi.mocked(reportsApi.getDailySales).mockResolvedValue(defaultReport);

    render(<ReportsPage />);

    await waitFor(() => {
      expect(reportsApi.getDailySales).toHaveBeenCalled();
    });
    await waitFor(() => {
      expect(screen.getByText(/2025-02-15/)).toBeInTheDocument();
      expect(screen.getByText(/₱1500\.00/)).toBeInTheDocument();
      expect(screen.getByText("Total income")).toBeInTheDocument();
    });
  });

  it("refetches when date changes (useEffect triggers on date change)", async () => {
    vi.mocked(reportsApi.getDailySales)
      .mockResolvedValueOnce(defaultReport)
      .mockResolvedValueOnce(defaultReport)
      .mockResolvedValueOnce(defaultReport)
      .mockResolvedValueOnce(defaultReport)
      .mockResolvedValueOnce(defaultReport)
      .mockResolvedValueOnce(defaultReport)
      .mockResolvedValueOnce(defaultReport)
      .mockResolvedValueOnce({
        date: "2025-02-15",
        totalIncome: 1500,
        paidOrdersCount: 5,
      })
      .mockResolvedValueOnce({
        date: "2025-02-16",
        totalIncome: 2000,
        paidOrdersCount: 7,
      });

    render(<ReportsPage />);

    await waitFor(() => {
      expect(reportsApi.getDailySales).toHaveBeenCalled();
    });

    const dateInput = screen.getByLabelText(/^date$/i);
    fireEvent.change(dateInput, { target: { value: "2025-02-16" } });

    await waitFor(() => {
      expect(reportsApi.getDailySales).toHaveBeenLastCalledWith("2025-02-16");
    });
  });

  it("displays error when API fails", async () => {
    vi.mocked(reportsApi.getDailySales).mockRejectedValue(
      new Error("Network error")
    );

    render(<ReportsPage />);

    await waitFor(() => {
      expect(screen.getByText(/network error|failed to load report/i)).toBeInTheDocument();
    });
  });

  it("shows ChartSkeleton while chart loading (Phase 12)", async () => {
    const chartPromise = new Promise<{ date: string; totalIncome: number; paidOrdersCount: number }>(
      () => {}
    );
    vi.mocked(reportsApi.getDailySales)
      .mockResolvedValueOnce(defaultReport)
      .mockReturnValue(chartPromise);

    render(<ReportsPage />);

    await waitFor(() => {
      expect(screen.getByText(/last 7 days/i)).toBeInTheDocument();
    });
    const skeleton = document.querySelector(".animate-pulse");
    expect(skeleton).toBeInTheDocument();
  });

  it("shows Bar chart when chart data loaded (Phase 12)", async () => {
    const chartData = [
      { date: "2025-02-09", totalIncome: 100, paidOrdersCount: 1 },
      { date: "2025-02-10", totalIncome: 200, paidOrdersCount: 2 },
      { date: "2025-02-11", totalIncome: 150, paidOrdersCount: 1 },
      { date: "2025-02-12", totalIncome: 300, paidOrdersCount: 3 },
      { date: "2025-02-13", totalIncome: 250, paidOrdersCount: 2 },
      { date: "2025-02-14", totalIncome: 180, paidOrdersCount: 2 },
      { date: "2025-02-15", totalIncome: 400, paidOrdersCount: 4 },
    ];
    vi.mocked(reportsApi.getDailySales)
      .mockResolvedValueOnce(defaultReport)
      .mockResolvedValueOnce(chartData[0])
      .mockResolvedValueOnce(chartData[1])
      .mockResolvedValueOnce(chartData[2])
      .mockResolvedValueOnce(chartData[3])
      .mockResolvedValueOnce(chartData[4])
      .mockResolvedValueOnce(chartData[5])
      .mockResolvedValueOnce(chartData[6]);

    render(<ReportsPage />);

    await waitFor(() => {
      expect(reportsApi.getDailySales).toHaveBeenCalled();
    });

    await waitFor(() => {
      const chartContainer = document.querySelector(".recharts-responsive-container");
      expect(chartContainer).toBeInTheDocument();
    });
  });
});
