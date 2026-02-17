/**
 * Phase 12 — Home page tests (Dashboard chart, skeleton).
 */

import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { reportsApi } from "@/lib/api/reports";
import Home from "./page";

vi.mock("@/lib/api/reports", () => ({
  reportsApi: {
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
    user: { userId: "owner-1", username: "owner", role: "OWNER" },
    loading: false,
    logout: vi.fn(),
  }),
}));

describe("Home", () => {
  it("renders heading and links", async () => {
    vi.mocked(reportsApi.getDailySales).mockResolvedValue({
      date: "2025-02-15",
      totalIncome: 100,
      paidOrdersCount: 1,
    });

    render(<Home />);

    expect(screen.getByRole("heading", { name: /dashboard/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /new order/i })).toHaveAttribute("href", "/orders/new");
    expect(screen.getByRole("link", { name: /view orders/i })).toHaveAttribute("href", "/orders");
    expect(screen.getByRole("link", { name: /track order/i })).toHaveAttribute("href", "/track");
    expect(screen.getByRole("link", { name: /reports/i })).toHaveAttribute("href", "/reports");
  });

  it("shows ChartSkeleton while loading (Phase 12)", () => {
    const promise = new Promise<{ date: string; totalIncome: number; paidOrdersCount: number }>(
      () => {}
    );
    vi.mocked(reportsApi.getDailySales).mockReturnValue(promise);

    render(<Home />);

    expect(screen.getByText(/sales — last 7 days/i)).toBeInTheDocument();
    const skeleton = document.querySelector(".animate-pulse");
    expect(skeleton).toBeInTheDocument();
  });

  it("shows Bar chart when data loaded (Phase 12)", async () => {
    vi.mocked(reportsApi.getDailySales)
      .mockResolvedValueOnce({ date: "2025-02-09", totalIncome: 100, paidOrdersCount: 1 })
      .mockResolvedValueOnce({ date: "2025-02-10", totalIncome: 200, paidOrdersCount: 2 })
      .mockResolvedValueOnce({ date: "2025-02-11", totalIncome: 150, paidOrdersCount: 1 })
      .mockResolvedValueOnce({ date: "2025-02-12", totalIncome: 300, paidOrdersCount: 3 })
      .mockResolvedValueOnce({ date: "2025-02-13", totalIncome: 250, paidOrdersCount: 2 })
      .mockResolvedValueOnce({ date: "2025-02-14", totalIncome: 180, paidOrdersCount: 2 })
      .mockResolvedValueOnce({ date: "2025-02-15", totalIncome: 400, paidOrdersCount: 4 });

    render(<Home />);

    await waitFor(() => {
      expect(reportsApi.getDailySales).toHaveBeenCalled();
    });

    await waitFor(() => {
      const chartContainer = document.querySelector(".recharts-responsive-container");
      expect(chartContainer).toBeInTheDocument();
    });
  });

  it("shows no sales message when chart data empty", async () => {
    vi.mocked(reportsApi.getDailySales).mockRejectedValue(new Error("No data"));

    render(<Home />);

    await waitFor(() => {
      expect(screen.getByText(/no sales data for the last 7 days/i)).toBeInTheDocument();
    });
  });
});
