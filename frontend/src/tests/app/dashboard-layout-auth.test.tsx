import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import DashboardLayout from "@/app/(dashboard)/layout";

const useRequireAuth = vi.hoisted(() => vi.fn());

vi.mock("next/navigation", () => ({
  usePathname: () => "/overview",
  useRouter: () => ({ replace: vi.fn() }),
}));

vi.mock("@/stores/auth-store", () => ({
  useAuth: () => ({ user: null, loading: false }),
  useRequireAuth,
}));

vi.mock("@/stores/layout-store", () => ({
  useLayout: () => ({ isSidebarCollapsed: false }),
}));

vi.mock("@/components/layout", () => ({
  Sidebar: () => <div />,
  MobileNav: () => <div />,
  AuthGuard: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  Topbar: () => <div />,
  InactivityOverlay: () => <div />,
}));

vi.mock("@/components/ui", () => ({ MeshBackground: () => <div /> }));
vi.mock("@/features/shared", () => ({ LoadingState: () => <div /> }));
vi.mock("@/components/features/settings/SystemPauseBanner", () => ({
  SystemPauseBanner: () => <div />,
}));

describe("DashboardLayout", () => {
  it("starts the auth redirect when a protected route has no user", () => {
    render(
      <DashboardLayout>
        <div />
      </DashboardLayout>
    );

    expect(useRequireAuth).toHaveBeenCalledWith("/overview");
  });
});
