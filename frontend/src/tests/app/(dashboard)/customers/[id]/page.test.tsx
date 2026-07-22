import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { UI_LABELS } from "@/constants/ui";
import { customersService } from "@/lib/api/customers";
import { ordersService } from "@/lib/api/orders";
import CustomerProfilePage from "@/app/(dashboard)/customers/[id]/client";

// Mock services
vi.mock("@/lib/api/customers", () => ({
  customersService: {
    getById: vi.fn(),
  },
}));

vi.mock("@/lib/api/orders", () => ({
  ordersService: {
    list: vi.fn(),
  },
}));

// Mock Auth
vi.mock("@/stores/auth-store", () => ({
  useAuth: () => ({ user: { userId: "staff-1", username: "staff", role: "STAFF" }, loading: false }),
}));

// Mock Next.js navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
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

describe("CustomerProfilePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockCustomer = {
    id: '1',
    firstName: "Mark",
    lastName: "Alvin",
    contactNumber: "09123456789",
    isActive: true,
  };

  const mockOrders = {
    content: [
      {
        id: '1',
        trackingNumber: "ORD-HIST-01",
        grandTotal: 150,
        currentStatus: "RELEASED",
        createdAt: new Date().toISOString(),
      },
      {
        id: '2',
        trackingNumber: "ORD-HIST-02",
        grandTotal: 300,
        currentStatus: "READY_FOR_PICKUP",
        createdAt: new Date().toISOString(),
      }
    ],
    page: 0,
    size: 10,
    totalElements: 2,
    totalPages: 1,
    first: true,
    last: true,
  };

  it("displays historical orders in tabular format per FR-PROF-1", async () => {
    vi.mocked(customersService.getById).mockResolvedValue(mockCustomer as any);
    vi.mocked(ordersService.list).mockResolvedValue(mockOrders as any);

    renderWithProvider(<CustomerProfilePage />);

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText("Mark Alvin")).toBeInTheDocument();
    });

    // Check if the history section title is rendered
    expect(screen.getByText(new RegExp(UI_LABELS.modules.orders.HISTORY, "i"))).toBeInTheDocument();

    // Verify it renders a table structure
    const table = screen.getByRole("table");
    expect(table).toBeInTheDocument();

    // Check if historical orders are listed in the table
    expect(screen.getByText("ORD-HIST-01")).toBeInTheDocument();
    expect(screen.getByText("ORD-HIST-02")).toBeInTheDocument();
  });

  it("groups transaction summary cards using spatial proximity per FR-PROF-2", async () => {
    vi.mocked(customersService.getById).mockResolvedValue(mockCustomer as any);
    vi.mocked(ordersService.list).mockResolvedValue(mockOrders as any);

    renderWithProvider(<CustomerProfilePage />);

    await waitFor(() => {
      expect(screen.getByText("Mark Alvin")).toBeInTheDocument();
    });

    // The KPI grid should act as a common spatial proximity wrapper
    const kpiGrid = screen.getByTestId("kpi-grid");
    expect(kpiGrid).toBeInTheDocument();
    expect(kpiGrid).toHaveClass("grid", "grid-cols-1", "md:grid-cols-3", "gap-grid-6");

    // It should contain the transaction summary cards
    expect(kpiGrid).toHaveTextContent(UI_LABELS.modules.customers.TOTAL_ORDERS);
    expect(kpiGrid).toHaveTextContent(UI_LABELS.modules.customers.LIFETIME_VALUE);
    expect(kpiGrid).toHaveTextContent(UI_LABELS.modules.customers.LAST_VISIT);
  });
});
