/**
 * Phase 9 — Login page tests.
 */

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import LoginPage from "@/app/(auth)/login/page";

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
    expect(screen.getByLabelText(/username/i, { selector: 'input' })).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i, { selector: 'input' })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /log in/i })).toBeInTheDocument();
  });

  it("renders track order link for public access", () => {
    render(<LoginPage />);
    expect(screen.getByRole("link", { name: /track here/i })).toHaveAttribute("href", "/track");
  });

  it("calls login with username and password on submit", async () => {
    mockLogin.mockResolvedValue(undefined);

    render(<LoginPage />);
    fireEvent.change(screen.getByLabelText(/username/i, { selector: 'input' }), { target: { value: "ADMIN" } });
    fireEvent.change(screen.getByLabelText(/password/i, { selector: 'input' }), { target: { value: "owner123" } });
    fireEvent.click(screen.getByRole("button", { name: /log in/i }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith("ADMIN", "owner123");
    });
  });

  it("submits form with entered credentials", async () => {
    mockLogin.mockRejectedValue(new Error("Invalid credentials"));

    render(<LoginPage />);
    fireEvent.change(screen.getByLabelText(/username/i, { selector: 'input' }), { target: { value: "wrong" } });
    fireEvent.change(screen.getByLabelText(/password/i, { selector: 'input' }), { target: { value: "wrong" } });
    fireEvent.click(screen.getByRole("button", { name: /log in/i }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith("wrong", "wrong");
    });
  });
});

