import { z } from "zod";

export const CustomerSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  contactNumber: z.string().regex(/^09\d{9}$/, "Must be a valid PH mobile number (09xxxxxxxxx)"),
});

export type CustomerInput = z.infer<typeof CustomerSchema>;
