/**
 * Phase 12 — TableSkeleton component tests.
 */

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TableSkeleton } from "@/components/ui/TableSkeleton";

describe("TableSkeleton", () => {
  it("renders table with default rows and cols", () => {
    render(<TableSkeleton />);
    const table = screen.getByRole("table");
    expect(table).toBeInTheDocument();
    const rows = table.querySelectorAll("tbody tr");
    expect(rows.length).toBe(5);
  });

  it("renders custom rows and cols", () => {
    render(<TableSkeleton rows={8} cols={5} />);
    const table = screen.getByRole("table");
    const headerCells = table.querySelectorAll("thead th");
    const bodyRows = table.querySelectorAll("tbody tr");
    expect(headerCells.length).toBe(5);
    expect(bodyRows.length).toBe(8);
  });

  it("has animate-pulse for layout stability (Phase 12)", () => {
    render(<TableSkeleton rows={3} cols={2} />);
    const pulse = document.querySelector(".animate-pulse");
    expect(pulse).toBeInTheDocument();
  });
});
