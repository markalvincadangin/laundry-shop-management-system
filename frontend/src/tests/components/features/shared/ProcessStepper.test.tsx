import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { ProcessStepper } from "@/components/features/shared/ProcessStepper";

describe("ProcessStepper", () => {
  it("renders a continuous horizontal line for Gestalt Continuity per FR-TRACK-1", () => {
    render(<ProcessStepper currentStatus="WASHING" />);

    // To satisfy FR-TRACK-1, there must be a background line spanning the full width
    const bgLine = screen.getByTestId("stepper-bg-line");
    expect(bgLine).toBeInTheDocument();
    expect(bgLine).toHaveClass("w-full");

    // And a progress line that indicates the current state
    const progressLine = screen.getByTestId("stepper-progress-line");
    expect(progressLine).toBeInTheDocument();
  });
});
