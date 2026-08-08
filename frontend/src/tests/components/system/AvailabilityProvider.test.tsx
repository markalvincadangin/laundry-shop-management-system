import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import {
  AvailabilityProvider,
  useAvailability,
  type AvailabilityProbe,
} from "@/components/system/AvailabilityProvider";

const SAVE_ORDER_LABEL = "Save order";

function ProtectedContent() {
  const { isWriteEnabled } = useAvailability();
  return <button disabled={!isWriteEnabled}>{SAVE_ORDER_LABEL}</button>;
}

function renderProvider(probe: AvailabilityProbe) {
  return render(
    <AvailabilityProvider probe={probe}>
      <ProtectedContent />
    </AvailabilityProvider>,
  );
}

describe("AvailabilityProvider", () => {
  it("shows the initial offline screen and retries into the usable application", async () => {
    const probe = vi.fn()
      .mockResolvedValueOnce("offline")
      .mockResolvedValueOnce("online");
    renderProvider(probe);

    expect(await screen.findByText("The shop system is currently offline")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Save order" })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Try again" }));

    expect(await screen.findByRole("button", { name: "Save order" })).toBeEnabled();
    expect(probe).toHaveBeenCalledTimes(2);
  });

  it("marks visible data stale and disables writes during an in-session outage, then reconnects", async () => {
    const probe = vi.fn().mockResolvedValue("online");
    renderProvider(probe);

    const saveOrder = await screen.findByRole("button", { name: "Save order" });
    expect(saveOrder).toBeEnabled();

    fireEvent(window, new Event("offline"));
    expect(await screen.findByText("Connection to the shop system was lost")).toBeInTheDocument();
    expect(saveOrder).toBeDisabled();

    fireEvent(window, new Event("online"));
    await waitFor(() => expect(screen.queryByText("Connection to the shop system was lost")).not.toBeInTheDocument());
    expect(saveOrder).toBeEnabled();
  });
});
