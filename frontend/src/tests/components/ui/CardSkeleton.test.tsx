/**
 * Phase 12 — CardSkeleton component tests.
 */

import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CardSkeleton } from "@/components/ui/CardSkeleton";

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
    const card = container.querySelector(".rounded-2xl.border.bg-white");
    expect(card).toBeInTheDocument();
  });

  it("renders skeleton elements with proper structure", () => {
    const { container } = render(<CardSkeleton />);
    const skeletonBars = container.querySelectorAll(".bg-white");
    expect(skeletonBars.length).toBeGreaterThan(0);
  });
});
