/**
 * Phase 11 — Notifications page tests.
 */

import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { UI_LABELS } from "@/constants/ui";
import { clientAlertsService } from "@/services/client-alerts.service";
import ClientAlertsPage from "@/app/(dashboard)/client-alerts/page";

// Mock services
vi.mock("@/services/client-alerts.service", () => ({
  clientAlertsService: {
    list: vi.fn(),
  },
}));

// Mock Auth
vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({ user: { userId: "staff-1", username: "staff", role: "STAFF" }, loading: false }),
}));

// Mock Next.js navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
  usePathname: () => "/client-alerts",
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

describe("ClientAlertsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders page header", () => {
    vi.mocked(clientAlertsService.list).mockResolvedValue({
      content: [],
      page: 0,
      size: 15,
      totalElements: 0,
      totalPages: 0,
      first: true,
      last: true
    } as any);
    renderWithProvider(<ClientAlertsPage />);
    expect(screen.getByText(new RegExp(UI_LABELS.modules.clientAlerts.TITLE, "i"))).toBeInTheDocument();
  });

  it("displays alerts in the list", async () => {
    vi.mocked(clientAlertsService.list).mockResolvedValue({
      content: [
        { 
          id: 1, 
          orderId: 1, 
          message: "Order Received", 
          status: "SENT", 
          createdAt: new Date().toISOString() 
        }
      ],
      page: 0,
      size: 15,
      totalElements: 1,
      totalPages: 1,
      first: true,
      last: true
    } as any);

    renderWithProvider(<ClientAlertsPage />);

    await waitFor(() => {
      expect(screen.getByText(/Order Received/i)).toBeInTheDocument();
    });
  });

  it("shows empty state when no alerts found", async () => {
    vi.mocked(clientAlertsService.list).mockResolvedValue({
      content: [],
      page: 0,
      size: 15,
      totalElements: 0,
      totalPages: 0,
      first: true,
      last: true
    } as any);

    renderWithProvider(<ClientAlertsPage />);

    await waitFor(() => {
      expect(screen.getByText(new RegExp(UI_LABELS.modules.clientAlerts.EMPTY_TITLE, "i"))).toBeInTheDocument();
    });
  });
});
