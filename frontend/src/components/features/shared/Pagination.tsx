import React from "react";
import { 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight 
} from "lucide-react";
import { Button } from "@/components/ui";
import { PaginationProps } from "@/types/components";
import { UI_LABELS } from "@/constants/ui";

/**
 * Optimized Pagination Molecule
 * Implements HCI Principles (Direct Access, Boundary Navigation, Spatial Context)
 * Aligned to Faith Laundry Brand Identity (Plus Jakarta Sans, Glassmorphism)
 */
export function Pagination({ 
  currentPage, 
  totalPages, 
  totalElements, 
  pageSize = 20,
  onPageChange, 
  onPageSizeChange,
  isLoading 
}: PaginationProps) {
  // Standardized: Never hide pagination if we have totalElements, so user can always see/change limit.
  if (totalElements === 0) return null;

  // HCI Logic: Calculate visible page range (±2 around current)
  const getPageRange = () => {
    const delta = 2;
    const range: (number | string)[] = [];
    const left = currentPage - delta;
    const right = currentPage + delta;
    
    for (let i = 0; i < totalPages; i++) {
      if (i === 0 || i === totalPages - 1 || (i >= left && i <= right)) {
        range.push(i);
      } else if (i === left - 1 || i === right + 1) {
        range.push("...");
      }
    }
    return Array.from(new Set(range));
  };

  const pages = getPageRange();
  
  // Calculate display range for context label
  const startEntry = totalElements === 0 ? 0 : currentPage * pageSize + 1;
  const endEntry = Math.min((currentPage + 1) * pageSize, totalElements || 0);

  return (
    <div className="flex flex-col lg:flex-row items-center justify-between gap-6 px-6 py-8 border-t border-slate-100 bg-white shadow-inner">
      <div className="flex flex-col md:flex-row items-center gap-6">
        {/* HCI Feedback: Spatial Context */}
        <div className="flex items-center gap-3">
          <div className="h-2 w-2 rounded-full bg-brand-blue shadow-[0_0_8px_rgba(21,72,157,0.3)]" />
          <span className="text-[11px] font-display font-bold uppercase tracking-[0.15em] text-slate-500 whitespace-nowrap">
            {UI_LABELS.pagination.SHOWING} <span className="text-slate-900">{startEntry} - {endEntry}</span> {UI_LABELS.pagination.OF} <span className="text-slate-900">{totalElements || "?"}</span> {UI_LABELS.pagination.TOTAL}
          </span>
        </div>

        {/* User Control: Rows Per Page */}
        {onPageSizeChange && (
          <div className="flex items-center gap-3 pl-6 border-l border-slate-100">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{UI_LABELS.pagination.SHOW}</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              disabled={isLoading}
              className="bg-slate-50 border border-slate-200 rounded-lg text-[11px] font-bold text-slate-900 px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-brand-blue/20 hover:bg-slate-100 transition-all cursor-pointer"
            >
              {[10, 20, 50, 100].map((size) => (
                <option key={size} value={size} className="text-slate-900">
                  {size} {UI_LABELS.pagination.ROWS}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="flex items-center gap-1.5">
        {/* Navigation Buttons */}
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => onPageChange(0)} 
          disabled={currentPage === 0 || isLoading}
          className="h-10 w-10 p-0 border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50"
          aria-label={UI_LABELS.pagination.FIRST}
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>

        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => onPageChange(currentPage - 1)} 
          disabled={currentPage === 0 || isLoading}
          className="h-10 w-10 p-0 border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50"
          aria-label={UI_LABELS.pagination.PREVIOUS}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div className="hidden md:flex items-center gap-1.5 mx-2">
          {pages.map((page, idx) => {
            if (typeof page === "string") {
              return (
                <span key={`ellipsis-${idx}`} className="px-2 text-slate-300">
                  {page}
                </span>
              );
            }
            
            const isCurrent = page === currentPage;
            return (
              <Button
                key={page}
                variant={isCurrent ? "primary" : "outline"}
                size="sm"
                onClick={() => onPageChange(page)}
                disabled={isLoading}
                className={`h-10 w-10 p-0 font-display font-bold transition-all duration-300 ${
                  isCurrent 
                    ? "shadow-lg shadow-brand-blue/20 scale-105" 
                    : "border-slate-200 bg-white hover:border-brand-blue/40"
                }`}
              >
                {page + 1}
              </Button>
            );
          })}
        </div>

        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => onPageChange(currentPage + 1)} 
          disabled={currentPage >= totalPages - 1 || isLoading}
          className="h-10 w-10 p-0 border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50"
          aria-label={UI_LABELS.pagination.NEXT}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>

        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => onPageChange(totalPages - 1)} 
          disabled={currentPage >= totalPages - 1 || isLoading}
          className="h-10 w-10 p-0 border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50"
          aria-label={UI_LABELS.pagination.LAST}
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
