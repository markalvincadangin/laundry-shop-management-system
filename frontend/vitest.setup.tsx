/**
 * Vitest setup for Phase 8 component tests.
 */
import React from "react";
import { vi } from "vitest";
import "@testing-library/jest-dom";

// Required for JSX in test files when using automatic JSX runtime
globalThis.React = React;

// Mock sonner toasts to avoid DOM side effects in tests
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
  },
}));
// Mock Recharts ResponsiveContainer to provide fixed dimensions in JSDOM
vi.mock("recharts", async () => {
  const OriginalModule = (await vi.importActual("recharts")) as any;
  return {
    ...OriginalModule,
    ResponsiveContainer: ({ children }: any) => (
      <div className="recharts-responsive-container" style={{ width: 800, height: 600 }}>
        {children}
      </div>
    ),
  };
});
