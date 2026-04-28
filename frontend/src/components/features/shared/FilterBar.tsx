import React from "react";
import { FilterBarProps } from "@/types/components";
import { Card, CardContent } from "@/components/ui";

export function FilterBar({ children, title }: FilterBarProps) {
  return (
    <Card className="shadow-lg overflow-hidden border-slate-200">
      {title && (
        <div className="px-6 py-3 border-b border-slate-100 bg-slate-50/50">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
            {title}
          </h3>
        </div>
      )}
      <CardContent className="p-6 flex flex-wrap items-end gap-6">
        {children}
      </CardContent>
    </Card>
  );
}
