/**
 * Phase 8 & 9 — Pay order page tests.
 */

import { render, screen, waitFor } from "@testing-library/react";
import { fireEvent } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ordersApi } from "@/lib/api/orders";
import { paymentsApi } from "@/lib/api/payments";
import PayOrderPage from "./page";

const { mockPush } = vi.hoisted(() => ({ mockPush: vi.fn() }));
vi.mock("next/navigation", () => ({
  useParams: () => ({ id: "1" }),
  useRouter: () => ({ push: mockPush, back: vi.fn() }),
}));

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({ user: { userId: "staff-1", username: "staff", role: "STAFF" } }),
}));

vi.mock("@/lib/api/orders", () => ({
  ordersApi: { getById: vi.fn() },
}));

vi.mock("@/lib/api/payments", () => ({
  paymentsApi: { create: vi.fn() },
}));

describe("PayOrderPage", () => {
  beforeEach(() => {
    vi.mocked(ordersApi.getById).mockResolvedValue({
      id: 1,
      grandTotal: 150,
    } as never);
  });

  it("pre-fills amount from order total", async () => {
    render(<PayOrderPage />);

    await waitFor(() => {
      expect(screen.getByDisplayValue("150.00")).toBeInTheDocument();
    });
  });

  it("displays order total", async () => {
    render(<PayOrderPage />);

    await waitFor(() => {
      expect(screen.getByText(/₱150\.00/)).toBeInTheDocument();
    });
  });

  it("submits payment and redirects on success", async () => {
    mockPush.mockClear();
    vi.mocked(paymentsApi.create).mockResolvedValue({} as never);

    render(<PayOrderPage />);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /record payment/i })).toBeEnabled();
    });

    const form = screen.getByRole("button", { name: /record payment/i }).closest("form");
    if (form) {
      fireEvent.submit(form);
    } else {
      fireEvent.click(screen.getByRole("button", { name: /record payment/i }));
    }

    await waitFor(() => {
      expect(paymentsApi.create).toHaveBeenCalledWith(
        expect.objectContaining({
          orderId: 1,
          amountPaid: 150,
          receivedByUserId: "staff-1",
        })
      );
      expect(mockPush).toHaveBeenCalledWith("/orders/1");
    });
  });
});
