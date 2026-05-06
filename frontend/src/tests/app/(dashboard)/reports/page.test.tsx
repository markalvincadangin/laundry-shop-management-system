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
    getSalesTrend: vi.fn(() => Promise.resolve([])),
  },
}));

vi.mock("@/services/orders.service", () => ({
  ordersService: {
    list: vi.fn(() => Promise.resolve({ content: [], page: 0, size: 10, totalElements: 0, totalPages: 0 })),
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
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/",
}));

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({ user: { userId: "admin-1", username: "admin", role: "ADMIN" }, loading: false }),
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

    expect(screen.getByText(new RegExp(UI_LABELS.layout.nav.REPORTS, "i"))).toBeInTheDocument();
    expect(screen.getByRole("button", { name: new RegExp(UI_LABELS.modules.reports.DAILY, "i") })).toBeInTheDocument();
  });

  it("fetches report on mount and displays data", async () => {
    vi.mocked(reportsService.getDailySales).mockResolvedValue(defaultReport);

    renderWithProvider(<ReportsPage />);

    await waitFor(() => {
      expect(reportsService.getDailySales).toHaveBeenCalled();
    });

    await waitFor(() => {
      // Check for revenue using a more flexible matcher for currency formatting
      expect(screen.getByText(/1.*500/)).toBeInTheDocument();
      expect(screen.getByText(UI_LABELS.modules.reports.TOTAL_REVENUE)).toBeInTheDocument();
    });
  });

  it("refetches when date changes", async () => {
    vi.mocked(reportsService.getDailySales).mockResolvedValue(defaultReport);

    renderWithProvider(<ReportsPage />);

    await waitFor(() => {
      expect(reportsService.getDailySales).toHaveBeenCalled();
    });

    const dateInput = screen.getByLabelText(new RegExp(UI_LABELS.modules.reports.SELECT_DATE, "i"));
    fireEvent.change(dateInput, { target: { value: "2025-02-16" } });

    await waitFor(() => {
      expect(reportsService.getDailySales).toHaveBeenLastCalledWith("2025-02-16");
    });
  });

  it("displays error when API fails", async () => {
    vi.mocked(reportsService.getDailySales).mockRejectedValue(new Error("Network error"));

    renderWithProvider(<ReportsPage />);

    await waitFor(() => {
      expect(screen.getByText(new RegExp(UI_LABELS.feedback.error.LOAD_FAILED, "i"))).toBeInTheDocument();
    });
  });

  it("shows KPICardSkeleton while report loading", async () => {
    const pendingPromise = new Promise(() => {});
    vi.mocked(reportsService.getDailySales).mockReturnValue(pendingPromise as any);

    renderWithProvider(<ReportsPage />);

    const skeletons = document.querySelectorAll(".animate-pulse");
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it("shows ChartSkeleton while chart loading", async () => {
    vi.mocked(reportsService.getDailySales).mockResolvedValue(defaultReport);
    const chartPromise = new Promise(() => {});
    vi.mocked(reportsService.getSalesTrend).mockReturnValue(chartPromise as any);

    renderWithProvider(<ReportsPage />);

    await waitFor(() => {
      expect(screen.getByText(UI_LABELS.modules.reports.TOTAL_REVENUE)).toBeInTheDocument();
    });

    const skeletons = document.querySelectorAll(".animate-pulse");
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it("renders correct labels", async () => {
    vi.mocked(reportsService.getDailySales).mockResolvedValue(defaultReport);
    renderWithProvider(<ReportsPage />);

    await waitFor(() => {
      expect(screen.getByText(UI_LABELS.modules.reports.TOTAL_REVENUE)).toBeInTheDocument();
      expect(screen.getByText(UI_LABELS.modules.reports.PAID_ORDERS)).toBeInTheDocument();
      expect(screen.getByText(UI_LABELS.modules.reports.AVG_SALE)).toBeInTheDocument();
    });
  });
});

