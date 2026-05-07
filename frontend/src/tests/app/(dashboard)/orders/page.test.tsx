/**
 * Phase 11 — Orders page tests (pagination, filters).
 * Phase 12 — Skeleton, EmptyState, toast.
 */

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { UI_LABELS } from "@/constants/ui";
import { ordersService } from "@/services/orders.service";
import OrdersPage from "@/app/(dashboard)/orders/page";

// Mock services
vi.mock("@/services/orders.service", () => ({
  ordersService: {
    list: vi.fn(),
    getStats: vi.fn(),
  },
}));

// Mock Auth
vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({ user: { userId: "staff-1", username: "staff", role: "STAFF" }, loading: false }),
}));

// Mock Next.js navigation
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/orders",
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

describe("OrdersPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(ordersService.getStats).mockResolvedValue({
      todaysOrders: 5,
      inProgress: 2,
      readyForPickup: 1,
      unpaidOrders: 2,
      todaysRevenue: 0,
    });
  });

  it("renders page header and stats", async () => {
    vi.mocked(ordersService.list).mockResolvedValue({
      content: [],
      page: 0,
      size: 10,
      totalElements: 0,
      totalPages: 0,
      first: true,
      last: true,
    } as any);

    renderWithProvider(<OrdersPage />);

    expect(screen.getAllByText(new RegExp(UI_LABELS.layout.nav.ORDERS, "i"))[0]).toBeInTheDocument();
    expect(screen.getByText(new RegExp(UI_LABELS.modules.orders.SUBTITLE, "i"))).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.getByText("5")).toBeInTheDocument(); // todaysOrders
      expect(screen.getByText(new RegExp(UI_LABELS.modules.dashboard.CREATED_TODAY, "i"))).toBeInTheDocument();
    });
  });

  it("displays orders in the table", async () => {
    vi.mocked(ordersService.list).mockResolvedValue({
      content: [
        {
          id: 1,
          referenceNumber: "ORD-TEST-001",
          customerName: "John Doe",
          weightKg: 5,
          totalLoads: 1,
          grandTotal: 150,
          currentStatus: "RECEIVED",
          paymentStatus: "UNPAID",
          createdAt: new Date().toISOString(),
        }
      ],
      page: 0,
      size: 10,
      totalElements: 1,
      totalPages: 1,
      first: true,
      last: true,
    } as any);

    renderWithProvider(<OrdersPage />);

    await waitFor(() => {
      expect(screen.getByText("ORD-TEST-001")).toBeInTheDocument();
      expect(screen.getByText("John Doe")).toBeInTheDocument();
    });
  });

  it("filters by status when selection changes", async () => {
    vi.mocked(ordersService.list).mockResolvedValue({
      content: [],
      page: 0,
      size: 10,
      totalElements: 0,
      totalPages: 0,
      first: true,
      last: true,
    } as any);

    renderWithProvider(<OrdersPage />);

    const statusSelect = screen.getByLabelText(new RegExp(UI_LABELS.shared.common.STATUS, "i"));
    fireEvent.change(statusSelect, { target: { value: "WASHING" } });

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith(expect.stringContaining("status=WASHING"), expect.anything());
    });
  });

  it("searches when typing in search box", async () => {
     vi.mocked(ordersService.list).mockResolvedValue({
      content: [],
      page: 0,
      size: 10,
      totalElements: 0,
      totalPages: 0,
      first: true,
      last: true,
    } as any);

    renderWithProvider(<OrdersPage />);

    const searchInput = screen.getByPlaceholderText(new RegExp(UI_LABELS.modules.orders.SEARCH_ORDERS, "i"));
    fireEvent.change(searchInput, { target: { value: "ORD-123" } });

    // Wait for debounce (400ms in component)
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith(expect.stringContaining("q=ORD-123"), expect.anything());
    }, { timeout: 2000 });
  });

  it("shows empty state when no orders found", async () => {
    vi.mocked(ordersService.list).mockResolvedValue({
      content: [],
      page: 0,
      size: 10,
      totalElements: 0,
      totalPages: 0,
      first: true,
      last: true,
    } as any);

    renderWithProvider(<OrdersPage />);

    await waitFor(() => {
      expect(screen.getByText(new RegExp(UI_LABELS.feedback.empty.ORDERS_TITLE, "i"))).toBeInTheDocument();
    });
  });
});

