/**
 * Phase 11 — Payment Settlement page tests.
 */

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { UI_LABELS } from "@/constants/ui";
import { ordersService } from "@/lib/api/orders";
import { paymentsService } from "@/lib/api/payments";
import PayOrderPage from "@/app/(dashboard)/orders/[id]/pay/client";

// Mock services
vi.mock("@/lib/api/orders", () => ({
  ordersService: {
    getById: vi.fn(),
  },
}));

vi.mock("@/lib/api/payments", () => ({
  paymentsService: {
    create: vi.fn(),
  },
}));

// Mock Auth
vi.mock("@/stores/auth-store", () => ({
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
    id: '1',
    trackingNumber: "ORD-TEST-123",
    grandTotal: 150,
    paymentStatus: "UNPAID",
  };

  it("renders payment form with total amount", async () => {
    vi.mocked(ordersService.getById).mockResolvedValue(mockOrder as any);

    renderWithProvider(<PayOrderPage />);

    await waitFor(() => {
      expect(screen.getByText(/150.00/i)).toBeInTheDocument();
      expect(screen.getByRole("button", { name: new RegExp(UI_LABELS.forms.checkout.SETTLE, "i") })).toBeInTheDocument();
    });
  });

  it("handles payment submission", async () => {
    vi.mocked(ordersService.getById).mockResolvedValue(mockOrder as any);
    vi.mocked(paymentsService.create).mockResolvedValue({ id: '99' } as any);

    renderWithProvider(<PayOrderPage />);

    const settleBtn = await screen.findByRole("button", { name: new RegExp(UI_LABELS.forms.checkout.SETTLE, "i") });
    
    await waitFor(() => {
      expect(settleBtn).not.toBeDisabled();
    });

    fireEvent.click(settleBtn);

    await waitFor(() => {
      expect(paymentsService.create).toHaveBeenCalledWith(expect.objectContaining({
        orderId: '1',
        amountPaid: 150,
        paymentMethod: "CASH",
      }));
    });
  });

  it("constrains Payment inputs to restricted choices per FR-PAY-1", async () => {
    vi.mocked(ordersService.getById).mockResolvedValue(mockOrder as any);

    renderWithProvider(<PayOrderPage />);

    // Verify only the three restricted methods are available
    await waitFor(() => {
      expect(screen.getByText(UI_LABELS.modules.payments.METHOD_CASH)).toBeInTheDocument();
      expect(screen.getByText(UI_LABELS.modules.payments.METHOD_GCASH)).toBeInTheDocument();
      expect(screen.getByText(UI_LABELS.modules.payments.METHOD_BANK)).toBeInTheDocument();
    });

    // There should be no generic "Amount" input editable by the user for full settlement
    // since the grandTotal is automatically applied.
    const amountInputs = screen.queryAllByRole("spinbutton");
    expect(amountInputs).toHaveLength(0); // the amount is read-only
  });
});
