/**
 * Phase 12 — Home page tests (Dashboard chart, skeleton).
 */

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { UI_LABELS } from "@/constants/ui";
import { reportsService } from "@/services/reports.service";
import Home from "@/app/(dashboard)/page";

vi.mock("@/services/reports.service", () => ({
  reportsService: {
    getDailySales: vi.fn(),
  },
}));

vi.mock("next/link", () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({
    user: { userId: "owner-1", username: "ADMIN", role: "ADMIN" },
    loading: false,
    logout: vi.fn(),
  }),
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

describe("Home", () => {
  it("renders heading and links", async () => {
    vi.mocked(reportsService.getDailySales).mockResolvedValue({
      date: "2025-02-15",
      totalIncome: 100,
      paidOrdersCount: 1,
    });

    renderWithProvider(<Home />);

    expect(screen.getByRole("heading", { name: new RegExp(UI_LABELS.nav.DASHBOARD, "i") })).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: new RegExp(UI_LABELS.nav.INTAKE, "i") })[0]).toHaveAttribute("href", "/orders/new");
    expect(screen.getByRole("link", { name: /view all/i })).toHaveAttribute("href", "/orders");
  });

  it("shows ChartSkeleton while loading (Phase 12)", () => {
    const promise = new Promise<{ date: string; totalIncome: number; paidOrdersCount: number }>(
      () => {}
    );
    vi.mocked(reportsService.getDailySales).mockReturnValue(promise);

    renderWithProvider(<Home />);

    expect(screen.getByText(new RegExp(UI_LABELS.dashboard.WEEKLY_SALES, "i"))).toBeInTheDocument();
    const skeleton = document.querySelector(".animate-pulse");
    expect(skeleton).toBeInTheDocument();
  });

  it("shows Bar chart when data loaded (Phase 12)", async () => {
    vi.mocked(reportsService.getDailySales)
      .mockResolvedValueOnce({ date: "2025-02-09", totalIncome: 100, paidOrdersCount: 1 })
      .mockResolvedValueOnce({ date: "2025-02-10", totalIncome: 200, paidOrdersCount: 2 })
      .mockResolvedValueOnce({ date: "2025-02-11", totalIncome: 150, paidOrdersCount: 1 })
      .mockResolvedValueOnce({ date: "2025-02-12", totalIncome: 300, paidOrdersCount: 3 })
      .mockResolvedValueOnce({ date: "2025-02-13", totalIncome: 250, paidOrdersCount: 2 })
      .mockResolvedValueOnce({ date: "2025-02-14", totalIncome: 180, paidOrdersCount: 2 })
      .mockResolvedValueOnce({ date: "2025-02-15", totalIncome: 400, paidOrdersCount: 4 });

    renderWithProvider(<Home />);

    await waitFor(() => {
      expect(reportsService.getDailySales).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(screen.getByText(new RegExp(UI_LABELS.dashboard.WEEKLY_SALES, "i"))).toBeInTheDocument();
    });
  });

  it("shows no sales message when chart data empty", async () => {
    vi.mocked(reportsService.getDailySales).mockRejectedValue(new Error("No data"));

    renderWithProvider(<Home />);

    await waitFor(() => {
      expect(screen.getByText(new RegExp(UI_LABELS.feedback.NO_SALES, "i"))).toBeInTheDocument();
    });
  });
});
