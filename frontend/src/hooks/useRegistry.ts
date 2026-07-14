"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useDebounce } from "./useDebounce";

interface RegistryOptions {
  defaultSortBy: string;
  defaultSortDir?: "asc" | "desc";
  defaultPageSize?: number;
  searchParamKey?: string;
  minSearchLength?: number;
}

/**
 * useRegistry Hook
 * The central engine for all dashboard list/registry pages.
 * Implements the "Registry Pattern" with URL synchronization, debounced search, 
 * and standardized tri-state sorting.
 */
export function useRegistry(options: RegistryOptions) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const searchKey = options.searchParamKey || "q";

  // 1. Derive state from URL
  const page = Number(searchParams.get("page") || "0");
  const size = Number(searchParams.get("size") || options.defaultPageSize || "15");
  const sortBy = searchParams.get("sortBy") || options.defaultSortBy;
  const sortDir = (searchParams.get("sortDir") as "asc" | "desc") || options.defaultSortDir || "desc";
  const q = searchParams.get(searchKey) || "";

  // 2. Search State (Internal vs Global)
  const [searchTerm, setSearchTerm] = useState(q);
  const debouncedSearchTerm = useDebounce(searchTerm, 400);
  const minSearchLength = options.minSearchLength ?? 0;

  /**
   * updateParams: Updates the URL search parameters and triggers a transition.
   * Mandated by FRONT-002 §8.1 (Registry URL Sync).
   */
  const updateParams = useCallback((newParams: Record<string, string | number | undefined>) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    
    Object.entries(newParams).forEach(([key, value]) => {
      if (value === undefined || value === "") {
        current.delete(key);
      } else {
        current.set(key, String(value));
      }
    });

    // Smart Pagination: Reset to page 0 if any filter other than 'page' changes
    if (!("page" in newParams)) {
      current.delete("page");
    }

    const query = current.toString();
    router.push(`${pathname}${query ? `?${query}` : ""}`, { scroll: false });
  }, [pathname, router, searchParams]);

  /**
   * handleSort: Implements standardized tri-state toggle sorting.
   * ASC ➔ DESC ➔ Default (None)
   */
  const handleSort = useCallback((key: string) => {
    let newDir: "asc" | "desc" | undefined = "asc";
    
    if (sortBy === key) {
      // Toggle logic: asc -> desc -> (if not default, reset) -> asc
      if (sortDir === "asc") {
        newDir = "desc";
      } else if (key === options.defaultSortBy) {
        // If it's the default column, never go to 'undefined' (reset), just cycle asc/desc
        newDir = "asc";
      } else {
        newDir = undefined;
      }
    }
    
    updateParams({ 
      sortBy: newDir ? key : undefined, 
      sortDir: newDir 
    });
  }, [sortBy, sortDir, updateParams, options.defaultSortBy]);

  // 3. Sync local search term with debounced URL update
  useEffect(() => {
    if (debouncedSearchTerm !== q) {
      if (debouncedSearchTerm.length >= minSearchLength || debouncedSearchTerm.length === 0) {
        updateParams({ [searchKey]: debouncedSearchTerm || undefined, page: 0 });
      }
    }
  }, [debouncedSearchTerm, q, searchKey, updateParams, minSearchLength]);

  // 4. Sync URL changes back to local input (e.g., browser back button)
  useEffect(() => {
    setSearchTerm(q);
  }, [q]);

  // 5. Build dynamic params object for API consumption
  const params = useMemo(() => {
    const p: Record<string, any> = {
      page,
      size,
      sortBy,
      sortDir,
    };
    
    // Add all current search params to the object for useOrders/usePayments etc.
    searchParams.forEach((value, key) => {
      p[key] = value;
    });

    return p;
  }, [page, size, sortBy, sortDir, searchParams]);

  return {
    params,            // Ready for service.list(params)
    page,
    size,
    sortBy,
    sortDir,
    searchTerm,        // For the Search Input value
    setSearchTerm,     // For the Search Input onChange
    updateParams,      // For manual filters (e.g. status select)
    handleSort,        // For table header clicks
  };
}
