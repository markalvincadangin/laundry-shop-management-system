/**
 * Phase 12 — EmptyState component tests.
 */

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { EmptyState } from "./EmptyState";

describe("EmptyState", () => {
  it("renders title", () => {
    render(<EmptyState title="No orders yet" />);
    expect(screen.getByText("No orders yet")).toBeInTheDocument();
  });

  it("renders description when provided", () => {
    render(
      <EmptyState
        title="No data"
        description="Create your first item to get started."
      />
    );
    expect(screen.getByText("No data")).toBeInTheDocument();
    expect(screen.getByText("Create your first item to get started.")).toBeInTheDocument();
  });

  it("renders icon when provided", () => {
    render(
      <EmptyState
        title="Empty"
        icon={<span data-testid="custom-icon">📦</span>}
      />
    );
    expect(screen.getByTestId("custom-icon")).toBeInTheDocument();
  });

  it("has accessible structure", () => {
    render(<EmptyState title="No results" description="Try a different search." />);
    const heading = screen.getByRole("heading", { level: 3, name: "No results" });
    expect(heading).toBeInTheDocument();
  });

  it("marks icon as decorative when no aria-label provided", () => {
    const { container } = render(
      <EmptyState
        title="Empty"
        icon={<span data-testid="decorative-icon">📦</span>}
      />
    );
    const iconWrapper = container.querySelector('[aria-hidden="true"]');
    expect(iconWrapper).toBeInTheDocument();
  });

  it("exposes icon to screen readers when iconAriaLabel provided", () => {
    const { container } = render(
      <EmptyState
        title="Empty"
        icon={<span data-testid="semantic-icon">⚠️</span>}
        iconAriaLabel="Warning icon"
      />
    );
    const iconWrapper = container.querySelector('[role="img"][aria-label="Warning icon"]');
    expect(iconWrapper).toBeInTheDocument();
  });
});
