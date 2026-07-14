/**
 * T010 — InactivityOverlay component tests.
 * TDD: these tests are written FIRST and must fail before implementation.
 *
 * Spec reference: "Implement a visual inactivity overlay after 5 minutes of
 * no interaction to obscure customer data when staff step away from the desk."
 * (spec.md edge case / T010)
 */

import { render, screen, act, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { InactivityOverlay } from "@/components/layout/InactivityOverlay";

// Mock framer-motion to avoid animation complexity in tests
vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

const FIVE_MINUTES_MS = 5 * 60 * 1000;

describe("InactivityOverlay", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it("does not show the overlay immediately on mount", () => {
    render(<InactivityOverlay />);
    expect(
      screen.queryByTestId("inactivity-overlay")
    ).not.toBeInTheDocument();
  });

  it("shows the overlay after 5 minutes of inactivity", () => {
    render(<InactivityOverlay />);
    act(() => {
      vi.advanceTimersByTime(FIVE_MINUTES_MS);
    });
    expect(screen.getByTestId("inactivity-overlay")).toBeInTheDocument();
  });

  it("does NOT show the overlay before 5 minutes have elapsed", () => {
    render(<InactivityOverlay />);
    act(() => {
      vi.advanceTimersByTime(FIVE_MINUTES_MS - 1);
    });
    expect(
      screen.queryByTestId("inactivity-overlay")
    ).not.toBeInTheDocument();
  });

  it("resets the timer on mousemove and hides overlay", () => {
    render(<InactivityOverlay />);
    // Trigger overlay
    act(() => {
      vi.advanceTimersByTime(FIVE_MINUTES_MS);
    });
    expect(screen.getByTestId("inactivity-overlay")).toBeInTheDocument();

    // User moves mouse — overlay should dismiss and timer resets
    act(() => {
      fireEvent.mouseMove(document);
    });
    expect(
      screen.queryByTestId("inactivity-overlay")
    ).not.toBeInTheDocument();
  });

  it("resets the timer on keydown and hides overlay", () => {
    render(<InactivityOverlay />);
    act(() => {
      vi.advanceTimersByTime(FIVE_MINUTES_MS);
    });
    expect(screen.getByTestId("inactivity-overlay")).toBeInTheDocument();

    act(() => {
      fireEvent.keyDown(document, { key: "Enter" });
    });
    expect(
      screen.queryByTestId("inactivity-overlay")
    ).not.toBeInTheDocument();
  });

  it("dismisses the overlay when the user clicks the dismiss button", () => {
    render(<InactivityOverlay />);
    act(() => {
      vi.advanceTimersByTime(FIVE_MINUTES_MS);
    });
    expect(screen.getByTestId("inactivity-overlay")).toBeInTheDocument();

    fireEvent.click(screen.getByTestId("inactivity-dismiss-btn"));
    expect(
      screen.queryByTestId("inactivity-overlay")
    ).not.toBeInTheDocument();
  });

  it("shows the overlay again after 5 more minutes of inactivity following dismissal", () => {
    render(<InactivityOverlay />);
    // First trigger
    act(() => {
      vi.advanceTimersByTime(FIVE_MINUTES_MS);
    });
    // Dismiss
    fireEvent.click(screen.getByTestId("inactivity-dismiss-btn"));
    // Should not be visible yet
    expect(
      screen.queryByTestId("inactivity-overlay")
    ).not.toBeInTheDocument();
    // 5 more minutes pass
    act(() => {
      vi.advanceTimersByTime(FIVE_MINUTES_MS);
    });
    expect(screen.getByTestId("inactivity-overlay")).toBeInTheDocument();
  });

  it("cleans up event listeners on unmount", () => {
    const removeSpy = vi.spyOn(document, "removeEventListener");
    const { unmount } = render(<InactivityOverlay />);
    unmount();
    // Each of the 5 event types should have been removed
    const removedEvents = removeSpy.mock.calls.map((c) => c[0]);
    expect(removedEvents).toContain("mousemove");
    expect(removedEvents).toContain("keydown");
    expect(removedEvents).toContain("mousedown");
    expect(removedEvents).toContain("touchstart");
    expect(removedEvents).toContain("scroll");
  });
});
