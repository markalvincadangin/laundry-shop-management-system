/**
 * Phase 12 — ChartSkeleton component tests.
 */

import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ChartSkeleton } from "@/components/ui/ChartSkeleton";

describe("ChartSkeleton", () => {
  it("renders without crashing", () => {
    const { container } = render(<ChartSkeleton />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it("has animate-pulse class for loading state", () => {
    const { container } = render(<ChartSkeleton />);
    const skeleton = container.querySelector(".animate-pulse");
    expect(skeleton).toBeInTheDocument();
  });

  it("applies proper CSS classes for chart layout", () => {
    const { container } = render(<ChartSkeleton />);
    const chart = container.querySelector(".rounded-2xl.border.bg-white");
    expect(chart).toBeInTheDocument();
  });

  it("renders 7 bar elements representing days of the week", () => {
    const { container } = render(<ChartSkeleton />);
    const bars = container.querySelectorAll(".flex-1.rounded-t.bg-white");
    expect(bars.length).toBe(7);
  });

  it("bars have varying heights for realistic appearance", () => {
    const { container } = render(<ChartSkeleton />);
    const bars = container.querySelectorAll(".flex-1.rounded-t.bg-white");
    const heights = Array.from(bars).map((bar) => 
      (bar as HTMLElement).style.height
    );
    
    // Ensure heights are different (not all the same)
    const uniqueHeights = new Set(heights);
    expect(uniqueHeights.size).toBeGreaterThan(1);
  });
});
