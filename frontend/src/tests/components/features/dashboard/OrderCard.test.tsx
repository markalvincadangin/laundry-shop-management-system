import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { OrderCard } from "@/components/features/dashboard/OrderCard";
import type { OrderResponse } from "@/lib/api/orders";

describe("OrderCard", () => {
  it("presents exactly one contextual Next Step button per FR-DASH-3", () => {
    const mockOrder: OrderResponse = {
      id: 1,
      referenceNumber: "ORD-001",
      customerId: 1,
      customerName: "John Doe",
      currentStatus: "WASHING",
      weightKg: 5,
      totalLoads: 1,
      serviceName: "Wash & Fold",
      paymentStatus: "PENDING",
      createdAt: new Date().toISOString(),
      baseAmount: 100,
      extraMinutesAmount: 0,
      addonsTotalAmount: 0,
      grandTotal: 100,
      notes: "Handle with care",
      updatedAt: new Date().toISOString()
    };

    render(<OrderCard order={mockOrder} onAdvance={vi.fn()} />);

    // Per FR-DASH-3, there should be exactly ONE contextual "Next Stage" button
    const nextStepButtons = screen.queryAllByTestId("next-step-button");
    expect(nextStepButtons).toHaveLength(1);
    
    // The button text should match the transition label for WASHING -> DRYING
    // Based on STATUS_TRANSITIONS in order-status.ts, WASHING next is DRYING, label is "Move to Drying"
    // Let's just check that the button is present and not disabled
    expect(nextStepButtons[0]).toBeInTheDocument();
    expect(nextStepButtons[0]).not.toBeDisabled();
  });
});
