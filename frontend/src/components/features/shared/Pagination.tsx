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
import { motion } from "framer-motion";

/**
 * Optimized Pagination Molecule — v5.0
 * Implements HCI Principles (Direct Access, Boundary Navigation, Spatial Context)
 * Hardened with premium interaction design and standardized high-fidelity aesthetics.
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
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col lg:flex-row items-center justify-between gap-grid-6 px-grid-10 py-grid-8 rounded-[2rem] bg-white/50 backdrop-blur-md border border-slate-200/40 shadow-sm"
    >
      <div className="flex flex-col md:flex-row items-center gap-grid-8">
        {/* HCI Feedback: Spatial Context */}
        <div className="flex items-center gap-grid-3 group">
          <div className="h-2.5 w-2.5 rounded-full bg-brand-blue shadow-[0_0_10px_rgba(21,72,157,0.4)] group-hover:scale-125 transition-transform duration-500" />
          <span className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 whitespace-nowrap">
            {UI_LABELS.pagination.SHOWING} <span className="text-slate-900 font-bold">{startEntry} — {endEntry}</span> {UI_LABELS.pagination.OF} <span className="text-slate-900 font-bold">{totalElements || "?"}</span>
          </span>
        </div>

        {/* User Control: Rows Per Page */}
        {onPageSizeChange && (
          <div className="flex items-center gap-grid-4 pl-grid-8 border-l border-slate-200/60 h-8">
            <span className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">{UI_LABELS.pagination.SHOW}</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              disabled={isLoading}
              className="bg-white border border-slate-200 rounded-xl text-[11px] font-black text-slate-900 px-grid-3 py-1 focus:outline-none focus:ring-4 focus:ring-brand-blue/5 hover:border-brand-blue/30 transition-all cursor-pointer shadow-sm"
            >
              {[10, 20, 50, 100].map((size) => (
                <option key={size} value={size} className="text-slate-900">
                  {size}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="flex items-center gap-grid-1.5">
        {/* Navigation Buttons */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100/50 rounded-2xl border border-slate-200/60">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => onPageChange(0)} 
            disabled={currentPage === 0 || isLoading}
            className="h-10 w-10 p-0 hover:bg-white hover:shadow-sm disabled:opacity-30 rounded-xl transition-all"
            aria-label={UI_LABELS.pagination.FIRST}
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>

          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => onPageChange(currentPage - 1)} 
            disabled={currentPage === 0 || isLoading}
            className="h-10 w-10 p-0 hover:bg-white hover:shadow-sm disabled:opacity-30 rounded-xl transition-all"
            aria-label={UI_LABELS.pagination.PREVIOUS}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <div className="hidden md:flex items-center gap-1 mx-1.5">
            {pages.map((page, idx) => {
              if (typeof page === "string") {
                return (
                  <span key={`ellipsis-${idx}`} className="px-2 text-slate-300 font-black">
                    {page}
                  </span>
                );
              }
              
              const isCurrent = page === currentPage;
              return (
                <Button
                  key={page}
                  variant={isCurrent ? "primary" : "ghost"}
                  size="sm"
                  onClick={() => onPageChange(page)}
                  disabled={isLoading}
                  className={`h-10 min-w-[40px] px-2 font-black text-[11px] transition-all duration-500 rounded-xl ${
                    isCurrent 
                      ? "shadow-lg shadow-brand-blue/20 bg-brand-blue text-white" 
                      : "hover:bg-white hover:shadow-sm text-slate-500"
                  }`}
                >
                  {page + 1}
                </Button>
              );
            })}
          </div>

          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => onPageChange(currentPage + 1)} 
            disabled={currentPage >= totalPages - 1 || isLoading}
            className="h-10 w-10 p-0 hover:bg-white hover:shadow-sm disabled:opacity-30 rounded-xl transition-all"
            aria-label={UI_LABELS.pagination.NEXT}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>

          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => onPageChange(totalPages - 1)} 
            disabled={currentPage >= totalPages - 1 || isLoading}
            className="h-10 w-10 p-0 hover:bg-white hover:shadow-sm disabled:opacity-30 rounded-xl transition-all"
            aria-label={UI_LABELS.pagination.LAST}
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
