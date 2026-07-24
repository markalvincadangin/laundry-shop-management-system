import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { IntakeWizard } from "@/components/features/orders/IntakeWizard";
import { ordersService } from "@/lib/api/orders";
import { toast } from "sonner";
import { useCustomerLookup } from "@/hooks/useCustomerLookup";
import { usePriceCalculation } from "@/hooks/usePriceCalculation";
import { useMachines } from "@/hooks/useMachines";
import { UI_LABELS } from "@/constants/ui";

vi.mock("@/lib/api/orders", () => ({
  ordersService: {
    create: vi.fn(),
  },
}));

vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

vi.mock("@/hooks/useCustomerLookup", () => ({
  useCustomerLookup: vi.fn(),
}));

vi.mock("@/hooks/usePriceCalculation", () => ({
  usePriceCalculation: vi.fn(),
}));

vi.mock("@/hooks/useMachines", () => ({
  useMachines: vi.fn(),
}));

vi.mock("@/components/features/orders/OrderPreview", () => ({
  OrderPreview: () => <div data-testid="order-preview-mock">{UI_LABELS.dynamic.ORDERPREVIEW_MOCK}</div>,
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

// Mock framer-motion to avoid animation delays
vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    circle: ({ children, ...props }: any) => <circle {...props}>{children}</circle>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

describe("IntakeWizard Submission", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useCustomerLookup as any).mockReturnValue({
      search: "",
      results: [],
      loading: false,
      selected: { id: '550e8400-e29b-41d4-a716-446655440000', firstName: "John", lastName: "Doe", contactNumber: "09171234567" },
      isRegistering: false,
      setSearch: vi.fn(),
    });
    (usePriceCalculation as any).mockReturnValue({
      preview: { grandTotal: 100, serviceBasePrice: 50, breakdown: [] },
      loading: false,
    });
    (useMachines as any).mockReturnValue({
      machines: [],
      isLoading: false,
    });
  });

  it("disables submit button and shows error toast on failure", async () => {
    // Simulate a slow request to test button disabled state
    (ordersService.create as any).mockImplementation(() => {
      return new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Simulated Error")), 100);
      });
    });

    render(<IntakeWizard createdByUserId="user-1" />);

    // Step 1: Customer (already selected via mock)
    const nextBtn = screen.getByRole("button", { name: /Next/i });
    await waitFor(() => {
        expect(nextBtn).not.toBeDisabled();
    });
    fireEvent.click(nextBtn);

    // Step 2: Service
    const weightInput = await screen.findByPlaceholderText("0.0");
    fireEvent.change(weightInput, { target: { value: "5" } });
    fireEvent.click(screen.getByRole("button", { name: /Next/i }));

    // Step 3: Addons
    fireEvent.click(screen.getByRole("button", { name: /Next/i }));

    // Step 4: Confirm
    const submitBtn = await screen.findByRole("button", { name: /Submit/i });
    const buttonElement = submitBtn;
    
    // We expect the button to not be disabled initially
    await waitFor(() => {
        expect(buttonElement).not.toBeDisabled();
    });

    fireEvent.click(buttonElement!);

    // Should disable and show loading
    await waitFor(() => {
        expect(buttonElement).toBeDisabled();
    });

    // After failure, toast should be called
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Simulated Error");
    });
    
    // Button should be re-enabled
    expect(buttonElement).not.toBeDisabled();
  });

  it("adds beforeunload listener when form is dirty and removes it on unmount", async () => {
    const addEventListenerSpy = vi.spyOn(window, "addEventListener");
    const removeEventListenerSpy = vi.spyOn(window, "removeEventListener");

    const { unmount } = render(<IntakeWizard createdByUserId="user-1" />);

    // Initially should not block (or rather, the event handler is added but might check isDirty inside)
    // Actually, react-hook-form isDirty is true when we change something.
    // Let's trigger a change.
    fireEvent.click(screen.getByRole("button", { name: /Next/i }));
    const weightInput = await screen.findByPlaceholderText("0.0");
    fireEvent.change(weightInput, { target: { value: "5" } });

    // Ensure the event handler was added (useEffect runs)
    expect(addEventListenerSpy).toHaveBeenCalledWith("beforeunload", expect.any(Function));

    // Simulate beforeunload
    const event = new Event("beforeunload", { cancelable: true });
    window.dispatchEvent(event);
    
    // We expect the default prevented if dirty, but since we can't easily assert on the exact event object mutated by our handler in jsdom, we just test if the listener is removed on unmount.
    unmount();
    expect(removeEventListenerSpy).toHaveBeenCalledWith("beforeunload", expect.any(Function));
  });

  it("structures the IntakeWizard as a 4-step wizard per FR-INTAKE-1 and FR-INTAKE-2", () => {
    render(<IntakeWizard createdByUserId="user-1" />);
    
    // Per FR-INTAKE-1, it should have exactly 4 step indicators
    const stepIndicators = screen.queryAllByTestId("wizard-step-indicator");
    expect(stepIndicators).toHaveLength(4);
    
    // The labels should match the expected 4 phases
    expect(stepIndicators[0]).toHaveTextContent(/CLIENT/i);
    expect(stepIndicators[1]).toHaveTextContent(/SERVICE/i);
    expect(stepIndicators[2]).toHaveTextContent(/EXTRAS/i);
    expect(stepIndicators[3]).toHaveTextContent(/REVIEW/i);
  });

  it("disables Submit button until a payment method is selected per FR-INTAKE-3", async () => {
    render(<IntakeWizard createdByUserId="user-1" />);

    // Step 1: Customer (already selected via mock)
    const nextBtn = screen.getByRole("button", { name: /Next/i });
    await waitFor(() => {
        expect(nextBtn).not.toBeDisabled();
    });
    fireEvent.click(nextBtn);

    // Step 2: Service
    const weightInput = await screen.findByPlaceholderText("0.0");
    fireEvent.change(weightInput, { target: { value: "5" } });
    fireEvent.click(screen.getByRole("button", { name: /Next/i }));

    // Step 3: Addons
    fireEvent.click(screen.getByRole("button", { name: /Next/i }));

    // Step 4: Confirm
    const submitBtn = await screen.findByRole("button", { name: /Submit/i });
    
    // Initially should be enabled (since collectPaymentNow is false)
    await waitFor(() => {
        expect(submitBtn).not.toBeDisabled();
    });

    // Toggle "Collect Payment Now"
    const collectPaymentBtn = screen.getByText(/Collect Payment Now/i);
    fireEvent.click(collectPaymentBtn);

    // Now it should be disabled because no payment method is selected yet
    await waitFor(() => {
        expect(submitBtn).toBeDisabled();
    });

    // Select CASH
    const cashBtn = screen.getByText("Cash", { exact: true, selector: "span" });
    fireEvent.click(cashBtn);

    // Now it should be enabled
    await waitFor(() => {
        expect(submitBtn).not.toBeDisabled();
    });
  });
});
