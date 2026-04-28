/**
 * Phase 8 — Public tracking page tests.
 */

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { UI_LABELS } from "@/constants/ui";
import { ordersService } from "@/services/orders.service";
import { ApiError } from "@/lib/api-client";
import TrackPage from "@/app/(public)/track/page";

// Mock services
vi.mock("@/services/orders.service", () => ({
  ordersService: {
    trackByReference: vi.fn(),
  },
}));

// Mock Next.js navigation
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
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

describe("TrackPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders track form", () => {
    renderWithProvider(<TrackPage />);
    expect(screen.getByPlaceholderText(new RegExp(UI_LABELS.tracking.PLACEHOLDER, "i"))).toBeInTheDocument();
  });

  it("shows order status when reference is found", async () => {
    const mockData = {
      referenceNumber: "ORD-123",
      currentStatus: "WASHING",
      customerName: "John Doe",
      createdAt: new Date().toISOString(),
      paymentStatus: "UNPAID",
    };
    vi.mocked(ordersService.trackByReference).mockResolvedValue(mockData as any);

    renderWithProvider(<TrackPage />);

    const input = screen.getByPlaceholderText(new RegExp(UI_LABELS.tracking.PLACEHOLDER, "i"));
    const button = screen.getByRole("button", { name: new RegExp(UI_LABELS.tracking.SEARCH_BUTTON, "i") });

    fireEvent.change(input, { target: { value: "ORD-123" } });
    fireEvent.click(button);

    // Wait for the service to be called
    await waitFor(() => {
      expect(ordersService.trackByReference).toHaveBeenCalledWith("ORD-123");
    });

    // Wait for the result to appear (bypass loader)
    expect(await screen.findByText(/ORD-123/i)).toBeInTheDocument();
    
    // Use role="status" to target the badge specifically and avoid collision with stepper
    expect(screen.getByRole("status")).toHaveTextContent(new RegExp(UI_LABELS.status.WASHING, "i"));
  });

  it("shows error message when reference is not found", async () => {
    vi.mocked(ordersService.trackByReference).mockRejectedValue(new ApiError(404, "NOT_FOUND", "Not Found"));

    renderWithProvider(<TrackPage />);

    const input = screen.getByPlaceholderText(new RegExp(UI_LABELS.tracking.PLACEHOLDER, "i"));
    const button = screen.getByRole("button", { name: new RegExp(UI_LABELS.tracking.SEARCH_BUTTON, "i") });

    fireEvent.change(input, { target: { value: "ORD-INVALID" } });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText(new RegExp(UI_LABELS.tracking.NOT_FOUND, "i"))).toBeInTheDocument();
    });
  });
});
