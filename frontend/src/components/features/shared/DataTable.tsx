import React from "react";
import { DataTableProps } from "@/types/components";
import { Card, TableSkeleton } from "@/components/ui";
import { UI_LABELS } from "@/constants/ui";
import { ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";

/**
 * Universal Data Table Organism
 * Mandated by FRONT-001 §5.3 and §1.5 (Aesthetic and Minimalist)
 * Supports Registry (Default) and Operational (Compact/Sticky) views.
 */
export function DataTable<T extends { id: string | number }>({ 
  data, 
  columns, 
  loading, 
  onRowClick, 
  emptyState,
  density = "default",
  isStickyHeader = false,
  maxHeight,
  scrollAreaClassName = "",
  sortBy,
  sortDir,
  onSort,
}: DataTableProps<T>) {
  if (loading && data.length === 0) {
    return <TableSkeleton rows={density === "compact" ? 5 : 8} cols={columns.length} />;
  }

  if (data.length === 0 && !loading) {
    return (
      <Card className="overflow-hidden border-slate-200">
        <div className="flex flex-col items-center justify-center p-20 text-center space-y-4">
          {emptyState || (
            <p className="text-sm font-medium text-slate-500">{UI_LABELS.feedback.empty.GENERIC_TITLE}</p>
          )}
        </div>
      </Card>
    );
  }

  return (
    <Card 
      className={`overflow-hidden border-slate-200 shadow-xl ${isStickyHeader ? "flex flex-col" : ""}`}
      style={maxHeight ? { maxHeight } : undefined}
    >
      <div className={`overflow-auto custom-scrollbar scrollbar-gutter-stable ${scrollAreaClassName}`}>
        <table className={`w-full text-left border-separate border-spacing-0`}>
          <thead className={isStickyHeader ? "sticky top-0 z-20" : ""}>
            <tr className="bg-slate-50">
              {columns.map((col, idx) => {
                const isSortable = col.sortable && col.sortKey && onSort;
                const isSorted = sortBy === col.sortKey;
                
                return (
                  <th 
                    key={idx} 
                    onClick={() => isSortable && onSort(col.sortKey!)}
                    className={`
                      px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 border-b border-slate-100
                      ${col.className || ""} 
                      ${col.align === "right" ? "text-right" : col.align === "center" ? "text-center" : ""}
                      ${isSortable ? "cursor-pointer hover:bg-slate-100 hover:text-slate-900 transition-all select-none group/header" : ""}
                    `}
                  >
                    <div className={`flex items-center gap-2 ${col.align === "right" ? "justify-end" : col.align === "center" ? "justify-center" : ""}`}>
                      {col.header}
                      {isSortable && (
                        <div className="flex flex-col opacity-100 transition-opacity">
                          {isSorted ? (
                            sortDir === "asc" ? <ChevronUp className="h-3 w-3 text-brand-blue" /> : <ChevronDown className="h-3 w-3 text-brand-blue" />
                          ) : (
                            <ChevronsUpDown className="h-3 w-3" />
                          )}
                        </div>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.map((row) => (
              <tr 
                key={row.id} 
                onClick={() => onRowClick?.(row)}
                className={`
                  hover:bg-slate-50/50 transition-colors group 
                  ${onRowClick ? "cursor-pointer" : ""}
                  ${density === "compact" ? "last:border-0" : ""}
                `}
              >
                {columns.map((col, idx) => (
                  <td 
                    key={idx} 
                    className={`
                      px-6 transition-all duration-300
                      ${density === "compact" ? "py-3" : "py-5"}
                      ${col.className || ""} 
                      ${col.align === "right" ? "text-right" : col.align === "center" ? "text-center" : ""}
                    `}
                  >
                    <div className={density === "compact" ? "scale-95 origin-left" : ""}>
                      {col.render 
                        ? col.render(row) 
                        : col.accessorKey 
                          ? (row[col.accessorKey] as React.ReactNode)
                          : null
                      }
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
