/**
 * Phase 12 — CardSkeleton component tests.
 */

import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CardSkeleton } from "./CardSkeleton";

describe("CardSkeleton", () => {
  it("renders without crashing", () => {
    const { container } = render(<CardSkeleton />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it("has animate-pulse class for loading state", () => {
    const { container } = render(<CardSkeleton />);
    const skeleton = container.querySelector(".animate-pulse");
    expect(skeleton).toBeInTheDocument();
  });

  it("applies proper CSS classes for card layout", () => {
    const { container } = render(<CardSkeleton />);
    const card = container.querySelector(".rounded-lg.border.border-slate-200.bg-white.p-6.shadow-sm");
    expect(card).toBeInTheDocument();
  });

  it("renders skeleton elements with proper structure", () => {
    const { container } = render(<CardSkeleton />);
    const skeletonBars = container.querySelectorAll(".bg-slate-200");
    expect(skeletonBars.length).toBeGreaterThan(0);
  });
});
