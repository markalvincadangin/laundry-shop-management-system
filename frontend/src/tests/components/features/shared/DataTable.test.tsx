import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { DataTable } from "@/components/features/shared/DataTable";
import type { DataTableColumn } from "@/types/components";

// Mock framer-motion to avoid animation delays
vi.mock("framer-motion", () => ({
  motion: {
    tr: ({ children, ...props }: any) => <tr {...props}>{children}</tr>,
  }
}));

describe("DataTable", () => {
  it("makes data rows fully clickable per FR-REG-1", () => {
    const data = [
      { id: 1, name: "Order 1" },
      { id: 2, name: "Order 2" },
    ];
    
    const columns: DataTableColumn<{ id: number; name: string }>[] = [
      { header: "Name", accessorKey: "name" },
    ];

    const mockOnRowClick = vi.fn();

    render(
      <DataTable
        data={data}
        columns={columns}
        onRowClick={mockOnRowClick}
      />
    );

    // Get all rows (excluding header)
    const rows = screen.getAllByRole("row");
    // Assuming the header is the first row, data rows start at index 1
    expect(rows).toHaveLength(3); // 1 header + 2 data

    const firstDataRow = rows[1];
    
    // Per FR-REG-1 (Fitts's Law), clicking anywhere on the row should trigger the action
    fireEvent.click(firstDataRow);
    
    expect(mockOnRowClick).toHaveBeenCalledTimes(1);
    expect(mockOnRowClick).toHaveBeenCalledWith(data[0]);

    // Ensure it has the cursor-pointer class to indicate clickability
    expect(firstDataRow).toHaveClass("cursor-pointer");
  });
});
