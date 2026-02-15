/**
 * Phase 8 — Reports page tests.
 */

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { reportsApi } from "@/lib/api/reports";
import ReportsPage from "./page";

vi.mock("@/lib/api/reports", () => ({
  reportsApi: {
    getDailySales: vi.fn(),
  },
}));

describe("ReportsPage", () => {
  it("renders heading and date picker", async () => {
    vi.mocked(reportsApi.getDailySales).mockResolvedValue({
      date: "2025-02-15",
      totalIncome: 1500,
      paidOrdersCount: 5,
    });

    render(<ReportsPage />);

    expect(screen.getByRole("heading", { name: /daily sales report/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/^date$/i)).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /refresh/i })).toBeInTheDocument();
    });
  });

  it("fetches report on mount and displays data", async () => {
    vi.mocked(reportsApi.getDailySales).mockResolvedValue({
      date: "2025-02-15",
      totalIncome: 1500,
      paidOrdersCount: 5,
    });

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

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /refresh/i })).toBeInTheDocument();
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
      expect(screen.getByText(/failed to load report/i)).toBeInTheDocument();
    });
  });
});
