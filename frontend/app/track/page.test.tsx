/**
 * Phase 8 — Track page tests.
 */

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@/lib/api/client";
import { ordersApi } from "@/lib/api/orders";
import TrackPage from "./page";

vi.mock("@/lib/api/orders", () => ({
  ordersApi: {
    trackByReference: vi.fn(),
  },
}));

describe("TrackPage", () => {
  beforeEach(() => {
    vi.mocked(ordersApi.trackByReference).mockClear();
  });

  it("renders heading and form", () => {
    render(<TrackPage />);
    expect(screen.getByRole("heading", { name: /faith laundry shop/i })).toBeInTheDocument();
    expect(screen.getByText(/track your laundry/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/reference number/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /track order/i })).toBeInTheDocument();
  });

  it("submits reference and displays order on success", async () => {
    const mockOrder = {
      referenceNumber: "ORD-001",
      currentStatus: "WASHING" as const,
      customerName: "Juan",
      grandTotal: 150,
      createdAt: "2025-02-15T10:00:00Z",
      paymentStatus: "UNPAID" as const,
    };
    vi.mocked(ordersApi.trackByReference).mockResolvedValue(mockOrder);

    render(<TrackPage />);
    fireEvent.change(screen.getByPlaceholderText(/reference number/i), {
      target: { value: "ORD-001" },
    });
    fireEvent.click(screen.getByRole("button", { name: /track/i }));

    await waitFor(() => {
      expect(ordersApi.trackByReference).toHaveBeenCalledWith("ORD-001");
    });
    await waitFor(() => {
      expect(screen.getByText("ORD-001")).toBeInTheDocument();
      expect(screen.getByRole("status", { name: /washing/i })).toBeInTheDocument();
      expect(screen.getByText(/₱150/)).toBeInTheDocument();
    });
  });

  it("displays 404 error message when reference not found", async () => {
    vi.mocked(ordersApi.trackByReference).mockRejectedValue(
      new ApiError(404, "NOT_FOUND", "Order not found")
    );

    render(<TrackPage />);
    fireEvent.change(screen.getByPlaceholderText(/reference number/i), {
      target: { value: "INVALID" },
    });
    fireEvent.click(screen.getByRole("button", { name: /track/i }));

    await waitFor(() => {
      expect(screen.getByText(/couldn't find that order|reference number not found/i)).toBeInTheDocument();
    });
  });

  it("does not submit when reference is empty", async () => {
    render(<TrackPage />);
    fireEvent.click(screen.getByRole("button", { name: /track/i }));

    await waitFor(() => {
      expect(ordersApi.trackByReference).not.toHaveBeenCalled();
    });
  });
});
