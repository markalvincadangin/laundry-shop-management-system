/**
 * Phase 8 — Track page tests.
 */

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
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
    expect(screen.getByRole("heading", { name: /track your order/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/reference number/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /track/i })).toBeInTheDocument();
  });

  it("submits reference and displays order on success", async () => {
    const mockOrder = {
      referenceNumber: "ORD-001",
      currentStatus: "WASHING",
      customerName: "Juan",
      grandTotal: 150,
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
      expect(screen.getByText(/order ord-001/i)).toBeInTheDocument();
      expect(screen.getByText(/washing/i)).toBeInTheDocument();
      expect(screen.getByText(/juan/i)).toBeInTheDocument();
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
      expect(screen.getByText(/reference number not found/i)).toBeInTheDocument();
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
