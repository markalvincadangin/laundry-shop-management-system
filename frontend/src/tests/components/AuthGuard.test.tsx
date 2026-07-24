/**
 * Phase 9 — AuthGuard component tests.
 */

import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AuthGuard } from "@/components/layout";
import { UI_LABELS } from "@/constants/ui";

vi.mock("next/navigation", () => ({
  usePathname: vi.fn(() => "/"),
}));

vi.mock("@/stores/auth-store", () => ({
  useRequireAuth: vi.fn(),
  useAuth: vi.fn(() => ({ user: { id: "1" }, loading: false })),
}));

describe("AuthGuard", () => {
  it("renders children", () => {
    render(
      <AuthGuard>
        <div>{UI_LABELS.dynamic.PROTECTED_CONTENT}</div>
      </AuthGuard>
    );
    expect(screen.getByText("Protected content")).toBeInTheDocument();
  });
});

