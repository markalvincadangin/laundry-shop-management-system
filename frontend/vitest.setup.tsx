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

// Mock framer-motion to bypass animation internals in tests
vi.mock("framer-motion", () => {
  const mockComponent = ({ children, ...props }: any) => <div {...props}>{children}</div>;
  const mockMotion: any = {
    div: mockComponent,
    span: ({ children, ...props }: any) => <span {...props}>{children}</span>,
    section: ({ children, ...props }: any) => <section {...props}>{children}</section>,
    nav: ({ children, ...props }: any) => <nav {...props}>{children}</nav>,
    p: ({ children, ...props }: any) => <p {...props}>{children}</p>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
    h1: ({ children, ...props }: any) => <h1 {...props}>{children}</h1>,
    h2: ({ children, ...props }: any) => <h2 {...props}>{children}</h2>,
    h3: ({ children, ...props }: any) => <h3 {...props}>{children}</h3>,
    tr: ({ children, ...props }: any) => <tr {...props}>{children}</tr>,
    tbody: ({ children, ...props }: any) => <tbody {...props}>{children}</tbody>,
    thead: ({ children, ...props }: any) => <thead {...props}>{children}</thead>,
    table: ({ children, ...props }: any) => <table {...props}>{children}</table>,
  };

  return {
    motion: mockMotion,
    AnimatePresence: ({ children }: any) => <>{children}</>,
  };
});
