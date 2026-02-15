/**
 * Phase 12 — Order detail page tests (status buttons, print receipt, toast).
 */

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { toast } from "sonner";
import { ordersApi } from "@/lib/api/orders";
import OrderDetailPage from "./page";

vi.mock("next/navigation", () => ({
  useParams: () => ({ id: "1" }),
}));

vi.mock("next/link", () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({ user: { userId: "staff-1", username: "staff", role: "STAFF" } }),
}));

vi.mock("@/lib/api/orders", () => ({
  ordersApi: {
    getById: vi.fn(),
    updateStatus: vi.fn(),
  },
}));

const mockOrder = {
  id: 1,
  referenceNumber: "LDR-20260213-1234",
  customerId: 1,
  weightKg: 5,
  totalLoads: 1,
  baseAmount: 100,
  extraMinutesAmount: 0,
  addonsTotalAmount: 0,
  grandTotal: 150,
  currentStatus: "RECEIVED" as const,
  paymentStatus: "UNPAID" as const,
  statusLogs: [] as { previousStatus: string | null; newStatus: string; changedAt: string | null; notes: string | null }[],
};

describe("OrderDetailPage", () => {
  it("renders order details and print-receipt element (Phase 12)", async () => {
    vi.mocked(ordersApi.getById).mockResolvedValue(mockOrder as never);

    render(<OrderDetailPage />);

    await waitFor(() => {
      expect(screen.getByText(/order LDR-20260213-1234/i)).toBeInTheDocument();
    });

    const printReceipt = document.querySelector(".print-receipt");
    expect(printReceipt).toBeInTheDocument();
    expect(printReceipt).toHaveTextContent("Faith Laundry Shop");
    expect(printReceipt).toHaveTextContent("LDR-20260213-1234");
  });

  it("status buttons have min 44px touch targets (Phase 12)", async () => {
    vi.mocked(ordersApi.getById).mockResolvedValue(mockOrder as never);

    render(<OrderDetailPage />);

    await waitFor(() => {
      expect(screen.getByText(/update status/i)).toBeInTheDocument();
    });

    const statusButtons = screen.getAllByRole("button", { name: /→ (washing|cancelled)/i });
    expect(statusButtons.length).toBeGreaterThan(0);
    statusButtons.forEach((btn) => {
      expect(btn).toHaveClass("min-h-[44px]");
      expect(btn).toHaveClass("touch-manipulation");
    });
  });

  it("calls toast.success on status update success (Phase 12)", async () => {
    vi.mocked(ordersApi.getById)
      .mockResolvedValueOnce(mockOrder as never)
      .mockResolvedValueOnce({ ...mockOrder, currentStatus: "WASHING" } as never);
    vi.mocked(ordersApi.updateStatus).mockResolvedValue({} as never);

    render(<OrderDetailPage />);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /→ washing/i })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: /→ washing/i }));

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith("Status updated successfully");
    });
  });

  it("calls toast.error on status update failure (Phase 12)", async () => {
    vi.mocked(ordersApi.getById).mockResolvedValue(mockOrder as never);
    vi.mocked(ordersApi.updateStatus).mockRejectedValue(new Error("Network error"));

    render(<OrderDetailPage />);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /→ washing/i })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: /→ washing/i }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalled();
    });
  });
});
