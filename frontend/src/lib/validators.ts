import { z } from "zod";

/**
 * Shared Zod schemas for form validation across the application.
 * Satisfies FRONT-002 §8.6.
 */

// --- Authentication ---

export const LoginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type LoginInput = z.infer<typeof LoginSchema>;

// --- Customer ---

export const CustomerSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  contactNumber: z.string().regex(/^09\d{9}$/, "Must be a valid PH mobile number (09xxxxxxxxx)"),
});

export type CustomerInput = z.infer<typeof CustomerSchema>;

// --- Order Intake ---

export const AddOnSchema = z.object({
  name: z.string().min(1, "Item name is required"),
  price: z.number().min(0, "Price must be positive"),
  quantity: z.number().int().min(1),
});

export const OrderIntakeSchema = z.object({
  staffUserId: z.string().min(1, "Staff ID is required"),
  customerId: z.number().int().positive().optional(),
  customer: CustomerSchema.optional(),
  weightKg: z.number().min(0.1, "Weight is required").max(500),
  extraMinutes: z.number().int().min(0),
  serviceType: z.string().min(1, "Service type is required"),
  notes: z.string().max(500).optional(),
  initialAddOns: z.array(AddOnSchema).optional(),
}).refine(data => data.customerId || data.customer, {
  message: "Either an existing customer must be selected or a new one registered",
  path: ["customerId"],
});

export type OrderIntakeInput = z.infer<typeof OrderIntakeSchema>;
