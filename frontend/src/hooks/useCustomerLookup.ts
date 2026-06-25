"use client";

import { useState, useEffect, useCallback } from "react";
import { customersService, CustomerResponse } from "@/lib/api/customers";

/**
 * useCustomerLookup: Shared logic for predictive customer search and registration.
 * Mandated by FRONT-002 §8.1.
 */
export function useCustomerLookup(initialQuery: string = "") {
  const [search, setSearch] = useState(initialQuery);
  const [results, setResults] = useState<CustomerResponse[]>([]);
  const [selected, setSelected] = useState<CustomerResponse | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchResults = useCallback(async (query: string) => {
    if (query.length < 2) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const data = await customersService.list({ q: query, size: 5 });
      setResults(data.content);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!selected && !isRegistering) {
      const timer = setTimeout(() => fetchResults(search), 500);
      return () => clearTimeout(timer);
    }
  }, [search, selected, isRegistering, fetchResults]);

  const select = (customer: CustomerResponse) => {
    setSelected(customer);
    setSearch(`${customer.firstName} ${customer.lastName}`);
    setResults([]);
  };

  const clear = () => {
    setSelected(null);
    setSearch("");
    setResults([]);
  };

  const selectById = useCallback(async (id: number) => {
    setLoading(true);
    try {
      const customer = await customersService.getById(id);
      setSelected(customer);
      setSearch(`${customer.firstName} ${customer.lastName}`);
    } catch {
      // Ignore errors, just don't select
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    search,
    setSearch,
    results,
    selected,
    select,
    selectById,
    clear,
    isRegistering,
    setIsRegistering,
    loading
  };
}

