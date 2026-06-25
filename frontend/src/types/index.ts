import { components } from "./api.generated";
export type { components };

export type OrderStatus = components["schemas"]["OrderStatus"];
export type PaymentStatus = components["schemas"]["PaymentStatus"];
export type UserRole = components["schemas"]["UserRole"];
export type PaymentMethod = components["schemas"]["PaymentMethod"];

export * from "./api";
