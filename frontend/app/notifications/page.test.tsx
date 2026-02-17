/**
 * Phase 10 — Notifications page tests.
 */

import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { notificationsApi } from "@/lib/api/notifications";
import NotificationsPage from "./page";

vi.mock("@/lib/api/notifications", () => ({
  notificationsApi: {
    list: vi.fn(),
  },
}));

describe("NotificationsPage", () => {
  it("renders heading and fetches notifications on mount", async () => {
    vi.mocked(notificationsApi.list).mockResolvedValue([]);

    render(<NotificationsPage />);

    expect(notificationsApi.list).toHaveBeenCalled();

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: /^notifications$/i })).toBeInTheDocument();
      expect(screen.getByText(/no notifications yet/i)).toBeInTheDocument();
    });
  });

  it("displays notification list when data returned", async () => {
    vi.mocked(notificationsApi.list).mockResolvedValue([
      {
        id: 1,
        orderId: 10,
        referenceNumber: "LDR-20260215-1234",
        customerId: 5,
        customerName: "John Doe",
        message: "Your order LDR-20260215-1234 is ready for pickup.",
        status: "PENDING",
        createdAt: "2025-02-15T10:00:00Z",
      },
    ]);

    render(<NotificationsPage />);

    await waitFor(() => {
      expect(screen.getByText(/John Doe/)).toBeInTheDocument();
      expect(screen.getByText(/Your order LDR-20260215-1234 is ready for pickup/)).toBeInTheDocument();
      expect(screen.getByText(/PENDING/)).toBeInTheDocument();
      expect(screen.getByRole("link", { name: /view order/i })).toHaveAttribute("href", "/orders/10");
    });
  });

  it("displays error when API fails", async () => {
    vi.mocked(notificationsApi.list).mockRejectedValue(new Error("Network error"));

    render(<NotificationsPage />);

    await waitFor(() => {
      expect(screen.getByText(/failed to load notifications/i)).toBeInTheDocument();
    });
  });

  it("renders Back to Orders link", async () => {
    vi.mocked(notificationsApi.list).mockResolvedValue([]);

    render(<NotificationsPage />);

    await waitFor(() => {
      expect(screen.getByRole("link", { name: /back to orders/i })).toHaveAttribute(
        "href",
        "/orders"
      );
    });
  });

});
