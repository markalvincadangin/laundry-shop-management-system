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
