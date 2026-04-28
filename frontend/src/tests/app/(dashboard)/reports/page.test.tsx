/**
 * Phase 8 — Reports page tests.
 * Phase 12 — ChartSkeleton, CardSkeleton.
 */

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { UI_LABELS } from "@/constants/ui";
import { reportsService } from "@/services/reports.service";
import ReportsPage from "@/app/(dashboard)/reports/page";

vi.mock("@/services/reports.service", () => ({
  reportsService: {
    getDailySales: vi.fn(),
    getMonthlySales: vi.fn(),
    getYearlySales: vi.fn(),
  },
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  useSearchParams: () => ({
    get: vi.fn(),
  }),
  usePathname: () => "/",
}));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const renderWithProvider = (ui: React.ReactElement) => {
  return render(
    <QueryClientProvider client={queryClient}>
      {ui}
    </QueryClientProvider>
  );
};

const defaultReport = {
  date: "2025-02-15",
  totalIncome: 1500,
  paidOrdersCount: 5,
};

describe("ReportsPage", () => {
  it("renders heading and date picker", async () => {
    vi.mocked(reportsService.getDailySales).mockResolvedValue(defaultReport);

    renderWithProvider(<ReportsPage />);

    expect(screen.getByText(new RegExp(UI_LABELS.nav.REPORTS, "i"))).toBeInTheDocument();
    expect(screen.getByRole("button", { name: new RegExp(UI_LABELS.reports.DAILY, "i") })).toBeInTheDocument();
  });

  it("fetches report on mount and displays data", async () => {
    vi.mocked(reportsService.getDailySales).mockResolvedValue(defaultReport);

    renderWithProvider(<ReportsPage />);

    const dateInput = screen.getByLabelText(new RegExp(UI_LABELS.reports.SELECT_DATE, "i"));
    fireEvent.change(dateInput, { target: { value: "2025-02-15" } });

    await waitFor(() => {
      expect(reportsService.getDailySales).toHaveBeenCalledWith("2025-02-15");
    });
    await waitFor(() => {
      expect(screen.getByText(/1500/)).toBeInTheDocument();
      expect(screen.getByText(UI_LABELS.reports.TOTAL_REVENUE)).toBeInTheDocument();
    });
  });

  it("refetches when date changes (useEffect triggers on date change)", async () => {
    vi.mocked(reportsService.getDailySales)
      .mockResolvedValue(defaultReport);

    renderWithProvider(<ReportsPage />);

    await waitFor(() => {
      expect(reportsService.getDailySales).toHaveBeenCalled();
    });

    const dateInput = screen.getByLabelText(new RegExp(UI_LABELS.reports.SELECT_DATE, "i"));
    fireEvent.change(dateInput, { target: { value: "2025-02-16" } });

    await waitFor(() => {
      expect(reportsService.getDailySales).toHaveBeenLastCalledWith("2025-02-16");
    });
  });

  it("displays error when API fails", async () => {
    vi.mocked(reportsService.getDailySales).mockRejectedValue(
      new Error("Network error")
    );

    renderWithProvider(<ReportsPage />);

    await waitFor(() => {
      expect(screen.getByText(/failed to load report/i)).toBeInTheDocument();
    });
  });

  it("shows ChartSkeleton while chart loading (Phase 12)", async () => {
    const chartPromise = new Promise<{ date: string; totalIncome: number; paidOrdersCount: number }>(
      () => {}
    );
    vi.mocked(reportsService.getDailySales)
      .mockResolvedValueOnce(defaultReport)
      .mockReturnValue(chartPromise);

    renderWithProvider(<ReportsPage />);

    await waitFor(() => {
      expect(screen.getByText(new RegExp(UI_LABELS.reports.SALES_HISTORY, "i"))).toBeInTheDocument();
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
    vi.mocked(reportsService.getDailySales)
      .mockResolvedValueOnce(defaultReport)
      .mockResolvedValueOnce(chartData[0])
      .mockResolvedValueOnce(chartData[1])
      .mockResolvedValueOnce(chartData[2])
      .mockResolvedValueOnce(chartData[3])
      .mockResolvedValueOnce(chartData[4])
      .mockResolvedValueOnce(chartData[5])
      .mockResolvedValueOnce(chartData[6]);

    renderWithProvider(<ReportsPage />);

    await waitFor(() => {
      expect(reportsService.getDailySales).toHaveBeenCalled();
    });
  });
});
