import type { components } from "./api.generated";

/**
 * API types for Faith Laundry Shop frontend.
 * ErrorResponse matches OpenAPI schema.
 */
export type ErrorResponse = components["schemas"]["ErrorResponse"];

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

