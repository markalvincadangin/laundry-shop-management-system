/**
 * Phase 8 & 9 — Nav component tests.
 * Phase 8: Navigation links. Phase 9: Role-based UI (Owner vs Staff).
 */

import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Nav } from "./Nav";

const mockLogout = vi.fn();
const mockUseAuth = vi.fn();
vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => mockUseAuth(),
}));

describe("Nav", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders Faith Laundry brand link", () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: false,
      logout: mockLogout,
    } as never);

    render(<Nav />);
    expect(screen.getByRole("link", { name: /faith laundry/i })).toBeInTheDocument();
  });

  it("shows Sign In when not authenticated", () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: false,
      logout: mockLogout,
    } as never);

    render(<Nav />);
    expect(screen.getByRole("link", { name: /sign in/i })).toHaveAttribute("href", "/login");
    expect(screen.queryByRole("link", { name: /daily report/i })).not.toBeInTheDocument();
  });

  it("shows Daily Report link when user is Owner", () => {
    mockUseAuth.mockReturnValue({
      user: { userId: "1", username: "owner", role: "OWNER" },
      loading: false,
      logout: mockLogout,
    } as never);

    render(<Nav />);
    expect(screen.getByRole("link", { name: /daily report/i })).toHaveAttribute("href", "/reports");
    expect(screen.getByText(/owner \(OWNER\)/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /logout/i })).toBeInTheDocument();
  });

  it("hides Daily Report when user is Staff", () => {
    mockUseAuth.mockReturnValue({
      user: { userId: "2", username: "staff", role: "STAFF" },
      loading: false,
      logout: mockLogout,
    } as never);

    render(<Nav />);
    expect(screen.queryByRole("link", { name: /daily report/i })).not.toBeInTheDocument();
    expect(screen.getByText(/staff \(STAFF\)/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /logout/i })).toBeInTheDocument();
  });

  it("calls logout when Logout button clicked", () => {
    mockUseAuth.mockReturnValue({
      user: { userId: "1", username: "owner", role: "OWNER" },
      loading: false,
      logout: mockLogout,
    } as never);

    render(<Nav />);
    fireEvent.click(screen.getByRole("button", { name: /logout/i }));

    expect(mockLogout).toHaveBeenCalled();
  });

  it("shows Orders, New Order, Notifications, Track for authenticated user", () => {
    mockUseAuth.mockReturnValue({
      user: { userId: "1", username: "staff", role: "STAFF" },
      loading: false,
      logout: mockLogout,
    } as never);

    render(<Nav />);
    expect(screen.getByRole("link", { name: /orders/i })).toHaveAttribute("href", "/orders");
    expect(screen.getByRole("link", { name: /new order/i })).toHaveAttribute("href", "/orders/new");
    expect(screen.getByRole("link", { name: /notifications/i })).toHaveAttribute(
      "href",
      "/notifications"
    );
    expect(screen.getByRole("link", { name: /track/i })).toHaveAttribute("href", "/track");
  });
});
