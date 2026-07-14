/**
 * Messaging Page Tests (v4.0)
 * Verifies the communication ledger functionality and layout.
 */

import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { UI_LABELS } from "@/constants/ui";
import { clientAlertsService } from "@/lib/api/client-alerts";
import MessagingPage from "@/app/(dashboard)/messaging/page";

// Mock services
vi.mock("@/lib/api/client-alerts", () => ({
  clientAlertsService: {
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
  usePathname: () => "/messaging",
  useSearchParams: () => new URLSearchParams(),
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

describe("MessagingPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders page header with standard messaging title", () => {
    vi.mocked(clientAlertsService.list).mockResolvedValue({
      content: [],
      page: 0,
      size: 15,
      totalElements: 0,
      totalPages: 0,
      first: true,
      last: true
    } as any);
    renderWithProvider(<MessagingPage />);
    expect(screen.getAllByText(new RegExp(UI_LABELS.modules.clientAlerts.TITLE, "i"))[0]).toBeInTheDocument();
  });

  it("displays coming soon placeholder", () => {
    renderWithProvider(<MessagingPage />);
    expect(screen.getByText(/Coming Soon/i)).toBeInTheDocument();
  });

  it("aligns delivery status indicators with Dashboard indicators per FR-MSG-1", () => {
    renderWithProvider(<MessagingPage />);
    const kpiGrid = screen.getByTestId("messaging-kpi-grid");
    expect(kpiGrid).toBeInTheDocument();
    expect(kpiGrid).toHaveTextContent("Messages Sent");
    expect(kpiGrid).toHaveTextContent("Delivered");
    expect(kpiGrid).toHaveTextContent("Failed");
  });
});
