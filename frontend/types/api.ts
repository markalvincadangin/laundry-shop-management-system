/**
 * API types for Faith Laundry Shop frontend.
 * ErrorResponse matches OpenAPI schema; details may be array or object (fieldErrors).
 */

export interface ErrorResponse {
  code: string;
  message: string;
  details?: unknown;
}
