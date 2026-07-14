import { renderHook, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useOrders } from "@/hooks/useOrders";
import { ordersService } from "@/lib/api/orders";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAuth } from "@/stores/auth-store";
import { toast } from "sonner";
import { UI_LABELS } from "@/constants/ui";

vi.mock("@/lib/api/orders", () => ({
  ordersService: {
    list: vi.fn(),
    getStats: vi.fn(),
    updateStatus: vi.fn(),
  },
}));

vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

vi.mock("@/stores/auth-store", () => ({
  useAuth: vi.fn(),
}));

describe("useOrders hook optimistic updates", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    (useAuth as any).mockReturnValue({ user: { userId: "user-1" } });
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it("optimistically updates order status", async () => {
    (ordersService.list as any).mockResolvedValue({
      content: [{ id: 1, currentStatus: "RECEIVED" }],
      page: 0,
      size: 10,
      totalElements: 1,
      totalPages: 1,
    });
    (ordersService.getStats as any).mockResolvedValue({});

    const { result } = renderHook(() => useOrders(), { wrapper });

    await waitFor(() => {
      expect(result.current.orders.length).toBe(1);
    });

    // Mock an artificially slow mutation
    (ordersService.updateStatus as any).mockImplementation(() => {
      return new Promise((resolve) => setTimeout(() => resolve({}), 100));
    });

    // Advance order
    result.current.advanceOrder(1, "WASHING" as any);

    // It should optimistically update immediately
    await waitFor(() => {
      expect(result.current.orders[0].currentStatus).toBe("WASHING");
    });
  });

  it("sanitizes 500 errors to prevent raw stack traces in UI toast", async () => {
    (ordersService.list as any).mockResolvedValue({
      content: [{ id: 1, currentStatus: "RECEIVED" }],
      page: 0,
      size: 10,
      totalElements: 1,
      totalPages: 1,
    });
    (ordersService.getStats as any).mockResolvedValue({});

    const { result } = renderHook(() => useOrders(), { wrapper });

    await waitFor(() => {
      expect(result.current.orders.length).toBe(1);
    });

    // Mock a 500 server error with a stack trace
    (ordersService.updateStatus as any).mockRejectedValue({
      response: {
        status: 500,
        data: { message: "java.lang.NullPointerException at com.himotech..." }
      }
    });

    // Advance order
    result.current.advanceOrder(1, "WASHING" as any);

    // Verify the error toast was sanitized
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(UI_LABELS.feedback.error.GENERIC);
    });
  });
});
