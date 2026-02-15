/**
 * Phase 8 — Nav component tests.
 */

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Nav } from "./Nav";

describe("Nav", () => {
  it("renders Faith Laundry brand link", () => {
    render(<Nav />);
    expect(screen.getByRole("link", { name: /faith laundry/i })).toBeInTheDocument();
  });

  it("renders all Phase 8 navigation links", () => {
    render(<Nav />);
    expect(screen.getByRole("link", { name: /orders/i })).toHaveAttribute("href", "/orders");
    expect(screen.getByRole("link", { name: /new order/i })).toHaveAttribute("href", "/orders/new");
    expect(screen.getByRole("link", { name: /track/i })).toHaveAttribute("href", "/track");
    expect(screen.getByRole("link", { name: /daily report/i })).toHaveAttribute("href", "/reports");
  });
});
