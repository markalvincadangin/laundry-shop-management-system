/**
 * Phase 9 — Login page tests.
 */

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import LoginPage from "./page";

const mockLogin = vi.fn();
vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({
    user: null,
    login: mockLogin,
    loading: false,
    error: null,
  }),
}));

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, replace: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

describe("LoginPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders sign in form", () => {
    render(<LoginPage />);
    expect(screen.getByRole("heading", { name: /faith laundry shop/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/^username$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument();
  });

  it("renders track order link for public access", () => {
    render(<LoginPage />);
    expect(screen.getByRole("link", { name: /track order/i })).toHaveAttribute("href", "/track");
  });

  it("calls login with username and password on submit", async () => {
    mockLogin.mockResolvedValue(undefined);

    render(<LoginPage />);
    fireEvent.change(screen.getByLabelText(/^username$/i), { target: { value: "owner" } });
    fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: "owner123" } });
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith("owner", "owner123");
    });
  });

  it("submits form with entered credentials", async () => {
    mockLogin.mockRejectedValue(new Error("Invalid credentials"));

    render(<LoginPage />);
    fireEvent.change(screen.getByLabelText(/^username$/i), { target: { value: "wrong" } });
    fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: "wrong" } });
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith("wrong", "wrong");
    });
  });
});
