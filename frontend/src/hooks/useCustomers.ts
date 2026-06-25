"use client";

import { useQuery } from "@tanstack/react-query";
import { customersService, CustomerListParams } from "@/lib/api/customers";

/**
 * useCustomers: Encapsulates customer discovery and management logic using TanStack Query.
 * Mandated by FRONT-002 §8.2 for Modular Logic and Caching.
 */
export function useCustomers(params: CustomerListParams = {}) {
  const {
    data,
    isLoading: loading,
    isError,
    error,
    refetch: refresh,
  } = useQuery({
    queryKey: ["customers", params],
    queryFn: () => customersService.list(params),
    placeholderData: (previousData) => previousData,
    staleTime: 60 * 1000, // 1 minute
  });

  return {
    customers: data?.content ?? [],
    loading,
    error: isError ? (error as any).message : null,
    pagination: {
      page: data?.page ?? 0,
      totalPages: data?.totalPages ?? 0,
      totalElements: data?.totalElements ?? 0,
    },
    refresh,
  };
}

/**
 * useCustomer: Retrieves full profile for a specific customer.
 */
export function useCustomer(customerId?: number) {
  const {
    data: customer,
    isLoading: loading,
    isError,
    error,
    refetch: refresh,
  } = useQuery({
    queryKey: ["customer", customerId],
    queryFn: () => customerId ? customersService.getById(customerId) : Promise.reject("No customer ID provided"),
    enabled: !!customerId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    customer,
    loading,
    error: isError ? (error as any).message : null,
    refresh,
  };
}

