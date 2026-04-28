/**
 * Phase 11 — Payment Settlement page tests.
 */

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { UI_LABELS } from "@/constants/ui";
import { ordersService } from "@/services/orders.service";
import { paymentsService } from "@/services/payments.service";
import PayOrderPage from "@/app/(dashboard)/orders/[id]/pay/page";

// Mock services
vi.mock("@/services/orders.service", () => ({
  ordersService: {
    getById: vi.fn(),
  },
}));

vi.mock("@/services/payments.service", () => ({
  paymentsService: {
    create: vi.fn(),
  },
}));

// Mock Auth
vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({ user: { userId: 123, username: "staff", role: "STAFF" }, loading: false }),
}));

// Mock Next.js navigation
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
  }),
  useParams: () => ({ id: "1" }),
}));

// Mock Link
vi.mock("next/link", () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

const createQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      gcTime: 0,
    },
  },
});

const renderWithProvider = (ui: React.ReactElement) => {
  const queryClient = createQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      {ui}
    </QueryClientProvider>
  );
};

describe("PayOrderPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockOrder = {
    id: 1,
    referenceNumber: "ORD-TEST-123",
    grandTotal: 150,
    paymentStatus: "UNPAID",
  };

  it("renders payment form with total amount", async () => {
    vi.mocked(ordersService.getById).mockResolvedValue(mockOrder as any);

    renderWithProvider(<PayOrderPage />);

    await waitFor(() => {
      expect(screen.getByText(/150.00/i)).toBeInTheDocument();
      expect(screen.getByRole("button", { name: new RegExp(UI_LABELS.checkout.SETTLE_PAYMENT, "i") })).toBeInTheDocument();
    });
  });

  it("handles payment submission", async () => {
    vi.mocked(ordersService.getById).mockResolvedValue(mockOrder as any);
    vi.mocked(paymentsService.create).mockResolvedValue({ id: 99 } as any);

    renderWithProvider(<PayOrderPage />);

    const settleBtn = await screen.findByRole("button", { name: new RegExp(UI_LABELS.checkout.SETTLE_PAYMENT, "i") });
    
    await waitFor(() => {
      expect(settleBtn).not.toBeDisabled();
    });

    fireEvent.click(settleBtn);

    await waitFor(() => {
      expect(paymentsService.create).toHaveBeenCalledWith(expect.objectContaining({
        orderId: 1,
        amountPaid: 150,
        paymentMethod: "CASH",
      }));
    });
  });
});
