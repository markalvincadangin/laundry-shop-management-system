/**
 * USER_ROLES: Single source of truth for Role-Based Access Control.
 * Mandated by FRONT-001 §4.1 and FRONT-002 §8.1.
 */
export const USER_ROLES = {
  ADMIN: "ADMIN",
  STAFF: "STAFF",
} as const;

export type UserRole = keyof typeof USER_ROLES;
