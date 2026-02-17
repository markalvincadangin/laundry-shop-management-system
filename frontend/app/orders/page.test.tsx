/**
 * Phase 11 — Orders page tests (pagination, filters).
 * Phase 12 — Skeleton, EmptyState, toast.
 */

import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { toast } from "sonner";
import { ordersApi, type OrderResponse } from "@/lib/api/orders";
import OrdersPage from "./page";

const mockOrder = (overrides: Partial<OrderResponse> = {}): OrderResponse =>
  ({
    id: 1,
    referenceNumber: "LDR-20260213-1234",
    customerId: 1,
    weightKg: 5,
    totalLoads: 1,
    baseAmount: 100,
    extraMinutesAmount: 0,
    addonsTotalAmount: 0,
    grandTotal: 150,
    currentStatus: "RECEIVED",
    paymentStatus: "UNPAID",
    ...overrides,
  }) as OrderResponse;

vi.mock("@/lib/api/orders", () => ({
  ordersApi: {
    list: vi.fn(),
  },
}));

vi.mock("next/link", () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

describe("OrdersPage", () => {
  it("renders heading and New Order link", async () => {
    vi.mocked(ordersApi.list).mockResolvedValue({
      content: [],
      page: 0,
      size: 20,
      totalElements: 0,
      totalPages: 0,
      first: true,
      last: true,
    });

    render(<OrdersPage />);

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: /orders/i })).toBeInTheDocument();
      expect(screen.getByRole("link", { name: /new order/i })).toHaveAttribute("href", "/orders/new");
    });
  });

  it("fetches orders on mount with page and size", async () => {
    vi.mocked(ordersApi.list).mockResolvedValue({
      content: [],
      page: 0,
      size: 20,
      totalElements: 0,
      totalPages: 0,
      first: true,
      last: true,
    });

    render(<OrdersPage />);

    await waitFor(() => {
      expect(ordersApi.list).toHaveBeenCalledWith(
        expect.objectContaining({ page: 0, size: 20 })
      );
    });
  });

  it("displays orders when data returned", async () => {
    vi.mocked(ordersApi.list).mockResolvedValue({
      content: [mockOrder()],
      page: 0,
      size: 20,
      totalElements: 1,
      totalPages: 1,
      first: true,
      last: true,
    });

    render(<OrdersPage />);

    await waitFor(() => {
      expect(screen.getByText("LDR-20260213-1234")).toBeInTheDocument();
      expect(screen.getByText("RECEIVED")).toBeInTheDocument();
      expect(screen.getByText("UNPAID")).toBeInTheDocument();
      expect(screen.getByText(/₱150\.00/)).toBeInTheDocument();
      expect(screen.getByRole("link", { name: /view/i })).toHaveAttribute("href", "/orders/1");
    });
  });

  it("displays error when API fails", async () => {
    vi.mocked(ordersApi.list).mockRejectedValue(new Error("Network error"));

    render(<OrdersPage />);

    await waitFor(() => {
      expect(screen.getByText(/failed to load orders/i)).toBeInTheDocument();
    });
  });

  it("shows toast.error when API fails (Phase 12)", async () => {
    vi.mocked(ordersApi.list).mockRejectedValue(new Error("Network error"));

    render(<OrdersPage />);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalled();
    });
  });

  it("shows TableSkeleton while loading (Phase 12)", () => {
    let resolve: (v: unknown) => void;
    const promise = new Promise((r) => {
      resolve = r;
    });
    vi.mocked(ordersApi.list).mockReturnValue(promise as never);

    render(<OrdersPage />);

    expect(screen.getByRole("table")).toBeInTheDocument();
    expect(screen.getByRole("table").querySelectorAll("tr").length).toBeGreaterThan(1);
  });

  it("shows EmptyState when no orders (Phase 12)", async () => {
    vi.mocked(ordersApi.list).mockResolvedValue({
      content: [],
      page: 0,
      size: 20,
      totalElements: 0,
      totalPages: 0,
      first: true,
      last: true,
    });

    render(<OrdersPage />);

    await waitFor(() => {
      expect(screen.getByText("No orders yet")).toBeInTheDocument();
      expect(screen.getByText(/create your first order to get started/i)).toBeInTheDocument();
    });
  });

  it("shows filter form with status, payment, from, to and Apply button", async () => {
    vi.mocked(ordersApi.list).mockResolvedValue({
      content: [],
      page: 0,
      size: 20,
      totalElements: 0,
      totalPages: 0,
      first: true,
      last: true,
    });

    render(<OrdersPage />);

    await waitFor(() => {
      expect(screen.getByText("Status")).toBeInTheDocument();
      expect(screen.getByText("Payment")).toBeInTheDocument();
      expect(screen.getByText("From")).toBeInTheDocument();
      expect(screen.getByText("To")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /apply/i })).toBeInTheDocument();
    });
  });

  it("applies filters and refetches with filter params", async () => {
    vi.mocked(ordersApi.list)
      .mockResolvedValueOnce({
        content: [],
        page: 0,
        size: 20,
        totalElements: 0,
        totalPages: 0,
        first: true,
        last: true,
      })
      .mockResolvedValueOnce({
        content: [],
        page: 0,
        size: 20,
        totalElements: 0,
        totalPages: 0,
        first: true,
        last: true,
      });

    render(<OrdersPage />);

    await waitFor(() => {
      expect(ordersApi.list).toHaveBeenCalledWith(expect.objectContaining({ page: 0, size: 20 }));
    });

    const statusBlock = screen.getByText("Status").closest("div");
    const statusSelect = within(statusBlock!).getByRole("combobox");
    fireEvent.change(statusSelect, { target: { value: "RECEIVED" } });

    const applyBtn = screen.getByRole("button", { name: /apply/i });
    fireEvent.click(applyBtn);

    await waitFor(() => {
      expect(ordersApi.list).toHaveBeenLastCalledWith(
        expect.objectContaining({
          status: "RECEIVED",
          page: 0,
          size: 20,
        })
      );
    });
  });

  it("shows pagination when totalPages > 1", async () => {
    vi.mocked(ordersApi.list).mockResolvedValue({
      content: [mockOrder({ referenceNumber: "ORD-1", grandTotal: 100 })],
      page: 0,
      size: 20,
      totalElements: 45,
      totalPages: 3,
      first: true,
      last: false,
    });

    render(<OrdersPage />);

    await waitFor(() => {
      expect(screen.getByText(/showing 1–20 of 45/i)).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /previous/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /next/i })).toBeInTheDocument();
    });
  });

  it("navigates to next page when Next clicked", async () => {
    vi.mocked(ordersApi.list)
      .mockResolvedValueOnce({
        content: [mockOrder({ referenceNumber: "ORD-1", grandTotal: 100 })],
        page: 0,
        size: 20,
        totalElements: 45,
        totalPages: 3,
        first: true,
        last: false,
      })
      .mockResolvedValueOnce({
        content: [
          mockOrder({
            id: 2,
            referenceNumber: "ORD-2",
            currentStatus: "READY_FOR_PICKUP",
            paymentStatus: "PAID",
            grandTotal: 200,
          }),
        ],
        page: 1,
        size: 20,
        totalElements: 45,
        totalPages: 3,
        first: false,
        last: false,
      });

    render(<OrdersPage />);

    await waitFor(() => {
      expect(screen.getByText("ORD-1")).toBeInTheDocument();
    });

    const nextBtn = screen.getByRole("button", { name: /next/i });
    fireEvent.click(nextBtn);

    await waitFor(() => {
      expect(ordersApi.list).toHaveBeenLastCalledWith(
        expect.objectContaining({ page: 1, size: 20 })
      );
    });
  });
});
