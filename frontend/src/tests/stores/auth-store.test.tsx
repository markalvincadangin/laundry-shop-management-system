import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AuthProvider, useAuth } from "@/stores/auth-store";

const authService = vi.hoisted(() => ({
  login: vi.fn(),
  logout: vi.fn(),
  me: vi.fn(),
}));

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock("@/lib/api/auth", () => ({ authService }));
vi.mock("@/lib/api-client", () => ({
  ApiError: class ApiError extends Error { status = 400; },
  getAccessToken: () => null,
  setAccessToken: vi.fn(),
}));

function AuthHarness() {
  const { login, user } = useAuth();
  return (
    <>
      <button onClick={() => login("admin", "admin123")}>Sign in</button>
      <output>{user?.username ?? "anonymous"}</output>
    </>
  );
}

describe("AuthProvider", () => {
  it("keeps a completed login when an earlier session check fails later", async () => {
    let rejectInitialCheck!: (reason?: unknown) => void;
    const initialCheck = new Promise<never>((_, reject) => {
      rejectInitialCheck = reject;
    });

    authService.me
      .mockReturnValueOnce(initialCheck)
      .mockResolvedValueOnce({ userId: "1", username: "admin", role: "ADMIN" });
    authService.login.mockResolvedValue({ accessToken: "token", role: "ADMIN", expiresIn: 900 });

    render(
      <AuthProvider>
        <AuthHarness />
      </AuthProvider>
    );

    await waitFor(() => expect(authService.me).toHaveBeenCalledTimes(1));
    fireEvent.click(screen.getByRole("button", { name: "Sign in" }));
    await screen.findByText("admin");

    await act(async () => rejectInitialCheck(new Error("expired session")));

    expect(screen.getByText("admin")).toBeInTheDocument();
  });
});
