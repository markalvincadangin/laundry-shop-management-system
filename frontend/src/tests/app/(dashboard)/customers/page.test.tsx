/**
 * Phase 11 — Customers page tests (pagination, filters).
 */

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { UI_LABELS } from "@/constants/ui";
import { customersService } from "@/lib/api/customers";
import CustomersPage from "@/app/(dashboard)/customers/page";

// Mock services
vi.mock("@/lib/api/customers", () => ({
  customersService: {
    list: vi.fn(),
  },
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
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/customers",
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

describe("CustomersPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders page header and search bar", async () => {
    vi.mocked(customersService.list).mockResolvedValue({
      content: [],
      page: 0,
      size: 10,
      totalElements: 0,
      totalPages: 0,
      first: true,
      last: true,
    });

    renderWithProvider(<CustomersPage />);

    expect(screen.getByRole("heading", { name: new RegExp(UI_LABELS.layout.nav.CUSTOMERS, "i") })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(new RegExp(UI_LABELS.modules.customers.SEARCH_CUSTOMERS, "i"))).toBeInTheDocument();
  });

  it("displays customers in the table", async () => {
    vi.mocked(customersService.list).mockResolvedValue({
      content: [
        {
          id: "1",
          firstName: "Mark",
          lastName: "Alvin",
          contactNumber: "09123456789",
          isActive: true,
        }
      ],
      page: 0,
      size: 10,
      totalElements: 1,
      totalPages: 1,
      first: true,
      last: true,
    });

    renderWithProvider(<CustomersPage />);

    await waitFor(() => {
      expect(screen.getByText("Mark Alvin")).toBeInTheDocument();
      expect(screen.getByText("09123456789")).toBeInTheDocument();
    });
  });

  it("implements predictive filtering after 2 characters per FR-CUST-2", async () => {
     vi.mocked(customersService.list).mockResolvedValue({
      content: [],
      page: 0,
      size: 10,
      totalElements: 0,
      totalPages: 0,
      first: true,
      last: true,
    });

    renderWithProvider(<CustomersPage />);

    const searchInput = screen.getByPlaceholderText(new RegExp(UI_LABELS.modules.customers.SEARCH_CUSTOMERS, "i"));
    
    // Type 1 char - should not trigger
    fireEvent.change(searchInput, { target: { value: "M" } });
    
    // Wait for debounce time
    await new Promise(r => setTimeout(r, 600));
    expect(mockPush).not.toHaveBeenCalledWith(expect.stringContaining("q=M"), expect.anything());

    // Type 2 chars - should trigger
    fireEvent.change(searchInput, { target: { value: "Ma" } });
    
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith(expect.stringContaining("q=Ma"), expect.anything());
    }, { timeout: 2000 });
  });

  it("shows empty state with register action when no customers found", async () => {
    vi.mocked(customersService.list).mockResolvedValue({
      content: [],
      page: 0,
      size: 10,
      totalElements: 0,
      totalPages: 0,
      first: true,
      last: true,
    });

    renderWithProvider(<CustomersPage />);

    await waitFor(() => {
      expect(screen.getByText(new RegExp(UI_LABELS.feedback.empty.CUSTOMERS_TITLE, "i"))).toBeInTheDocument();
      // Use getAllByText because the button appears both in header and empty state
      expect(screen.getAllByText(new RegExp(UI_LABELS.modules.customers.REGISTER_NEW, "i"))[0]).toBeInTheDocument();
    });
  });
});

