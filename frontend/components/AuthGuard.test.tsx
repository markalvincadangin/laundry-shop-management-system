/**
 * Phase 9 — AuthGuard component tests.
 */

import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AuthGuard } from "./AuthGuard";

vi.mock("next/navigation", () => ({
  usePathname: vi.fn(() => "/"),
}));

vi.mock("@/contexts/AuthContext", () => ({
  useRequireAuth: vi.fn(),
}));

describe("AuthGuard", () => {
  it("renders children", () => {
    render(
      <AuthGuard>
        <div>Protected content</div>
      </AuthGuard>
    );
    expect(screen.getByText("Protected content")).toBeInTheDocument();
  });
});
