import React from "react";
import { DataTableProps } from "@/types/components";
import { TableSkeleton } from "@/components/ui";
import { UI_LABELS } from "@/constants/ui";
import { ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";
import { motion } from "framer-motion";
import { useBreakpoint } from "@/hooks/useBreakpoint";

/**
 * Universal Data Table Organism — Premium (v5.0)
 * Mandated by FRONT-001 §5.3 and §1.5 (Aesthetic and Minimalist)
 * Supports Registry (Default) and Operational (Compact/Sticky) views.
 * v4.0 Consistency Pass: Standardized rounded-[2.5rem] containers and premium shadows.
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
  mobileCardRender,
}: DataTableProps<T>) {
  const { isMobile } = useBreakpoint();

  if (loading && data.length === 0) {
    return <TableSkeleton rows={density === "compact" ? 5 : 10} cols={columns.length} />;
  }

  if (data.length === 0 && !loading) {
    return (
      <div className="rounded-[2rem] border border-slate-200 bg-white shadow-xl shadow-slate-200/40 overflow-hidden">
        <div className="flex flex-col items-center justify-center p-24 text-center space-y-6">
          {emptyState || (
            <p className="text-body-sm font-black text-slate-500 uppercase tracking-widest">{UI_LABELS.feedback.empty.GENERIC_TITLE}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Mobile Touch Card View (<768px) */}
      {isMobile && mobileCardRender ? (
        <div className="space-y-4">
          {data.map((row, rIdx) => (
            <motion.div
              key={row.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: rIdx * 0.04 }}
              onClick={() => onRowClick?.(row)}
              className={`
                bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm 
                hover:shadow-md hover:border-brand-blue/30 active:scale-[0.98] 
                transition-all duration-200 ${onRowClick ? "cursor-pointer" : ""}
              `}
            >
              {mobileCardRender(row)}
            </motion.div>
          ))}
        </div>
      ) : (
        /* Desktop / Default Grid View (>=768px or fallback) */
        <div 
          className={`
            rounded-2xl border border-slate-200/60 bg-white shadow-lg shadow-slate-200/30 overflow-hidden transition-all duration-500
            ${isStickyHeader ? "flex flex-col" : ""}
          `}
          style={maxHeight ? { maxHeight } : undefined}
        >
          <div className={`overflow-auto custom-scrollbar scrollbar-gutter-stable ${scrollAreaClassName}`}>
            <table className={`w-full text-left border-separate border-spacing-0`}>
              <thead className={isStickyHeader ? "sticky top-0 z-20" : ""}>
                <tr className="bg-slate-50/80 backdrop-blur-md">
                  {columns.map((col, idx) => {
                    const isSortable = col.sortable && col.sortKey && onSort;
                    const isSorted = sortBy === col.sortKey;
                    
                    return (
                      <th 
                        key={idx} 
                        onClick={() => isSortable && onSort(col.sortKey!)}
                        className={`
                          px-8 py-5 text-[10px] font-black uppercase tracking-[0.25em] text-slate-500 border-b border-slate-100
                          ${col.className || ""} 
                          ${col.align === "right" ? "text-right" : col.align === "center" ? "text-center" : ""}
                          ${isSortable ? "cursor-pointer hover:bg-brand-blue/5 hover:text-brand-blue transition-all select-none group/header" : ""}
                        `}
                      >
                        <div className={`flex items-center gap-2 ${col.align === "right" ? "justify-end" : col.align === "center" ? "justify-center" : ""}`}>
                          {col.header}
                          {isSortable && (
                            <div className="flex flex-col opacity-50 group-hover/header:opacity-100 transition-opacity">
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
              <tbody className="divide-y divide-slate-100/60">
                {data.map((row, rIdx) => (
                  <motion.tr 
                    key={row.id} 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: rIdx * 0.03 }}
                    onClick={() => onRowClick?.(row)}
                    className={`
                      hover:bg-brand-blue/[0.01] transition-all duration-300 group 
                      ${onRowClick ? "cursor-pointer" : ""}
                      ${density === "compact" ? "last:border-0" : ""}
                    `}
                  >
                    {columns.map((col, idx) => (
                      <td 
                        key={idx} 
                        className={`
                          px-8 transition-all duration-300
                          ${density === "compact" ? "py-4" : "py-6"}
                          ${col.className || ""} 
                          ${col.align === "right" ? "text-right" : col.align === "center" ? "text-center" : ""}
                        `}
                      >
                        <div className={`${density === "compact" ? "scale-95 origin-left" : ""} group-hover:translate-x-1 transition-transform duration-500`}>
                          {col.render 
                            ? col.render(row) 
                            : col.accessorKey 
                              ? (row[col.accessorKey] as React.ReactNode)
                              : null
                          }
                        </div>
                      </td>
                    ))}
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
