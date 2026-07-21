/**
 * Phase 11 — Order Details page tests.
 */

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { UI_LABELS } from "@/constants/ui";
import { ordersService } from "@/lib/api/orders";
import OrderDetailsPage from "@/app/(dashboard)/orders/[id]/client";

// Mock services
vi.mock("@/lib/api/orders", () => ({
  ordersService: {
    getById: vi.fn(),
    updateStatus: vi.fn(),
  },
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  }
}));

// Mock Auth
vi.mock("@/stores/auth-store", () => ({
  useAuth: () => ({ user: { userId: "staff-1", username: "staff", role: "STAFF" }, loading: false }),
}));

// Mock Next.js navigation
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
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

describe("OrderDetailsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockOrder = {
    id: 1,
    referenceNumber: "ORD-TEST-123",
    customerName: "Mark Alvin",
    contactNumber: "09123456789",
    weightKg: 5.5,
    totalLoads: 1,
    baseAmount: 120,
    grandTotal: 120,
    currentStatus: "RECEIVED",
    paymentStatus: "UNPAID",
    createdAt: new Date().toISOString(),
    history: [],
  } as any;

  it("renders order details and current status", async () => {
    vi.mocked(ordersService.getById).mockResolvedValue(mockOrder);

    renderWithProvider(<OrderDetailsPage />);

    expect(await screen.findByText(/ORD-TEST-123/i)).toBeInTheDocument();
    expect(screen.getByText(/Mark Alvin/i)).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent(new RegExp(UI_LABELS.shared.status.RECEIVED, "i"));
  });

  it("shows transition button for next status", async () => {
    vi.mocked(ordersService.getById).mockResolvedValue(mockOrder);

    renderWithProvider(<OrderDetailsPage />);

    await waitFor(() => {
      expect(screen.getByText(UI_LABELS.modules.orders.ONE_TAP_WASH)).toBeInTheDocument();
    });
  });

  it("handles status transition when button clicked", async () => {
    vi.mocked(ordersService.getById).mockResolvedValue(mockOrder);
    vi.mocked(ordersService.updateStatus).mockResolvedValue({ ...mockOrder, currentStatus: "WASHING" });

    renderWithProvider(<OrderDetailsPage />);

    await waitFor(() => {
      const actionBtn = screen.getByText(UI_LABELS.modules.orders.ONE_TAP_WASH);
      fireEvent.click(actionBtn);
    });

    const confirmBtn = await screen.findByRole("button", { name: UI_LABELS.shared.buttons.CONFIRM });
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(ordersService.updateStatus).toHaveBeenCalled();
    });
  });

  it("adds undo notification window for status reversion per FR-DET-2", async () => {
    const { toast } = await import("sonner");
    vi.mocked(ordersService.getById).mockResolvedValue(mockOrder);
    vi.mocked(ordersService.updateStatus).mockResolvedValue({ ...mockOrder, currentStatus: "WASHING" });

    renderWithProvider(<OrderDetailsPage />);

    // Click to transition
    const actionBtn = await screen.findByText(UI_LABELS.modules.orders.ONE_TAP_WASH);
    fireEvent.click(actionBtn);

    // Confirm dialog
    const confirmBtn = await screen.findByRole("button", { name: UI_LABELS.shared.buttons.CONFIRM });
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(ordersService.updateStatus).toHaveBeenCalledWith(1, expect.objectContaining({ newStatus: "WASHING" }));
    });

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({
        action: expect.objectContaining({
          label: "Undo",
          onClick: expect.any(Function),
        })
      }));
    });
  });
});
