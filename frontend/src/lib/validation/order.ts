import { z } from "zod";
import { CustomerSchema } from "./customer";

export const AddOnSchema = z.object({
  name: z.string().min(1, "Item name is required"),
  price: z.number().min(0, "Price must be positive"),
  quantity: z.number().int().min(1),
});

/** Step 1: Customer Details Base Object */
const IntakeCustomerStepBase = z.object({
  customerId: z.number().int().positive().optional(),
  customer: CustomerSchema.optional(),
});

export const IntakeCustomerStepSchema = IntakeCustomerStepBase.refine(data => data.customerId || data.customer, {
  message: "Either an existing customer must be selected or a new one registered",
  path: ["customerId"],
});

/** Step 2: Service Configuration */
export const IntakeServiceStepSchema = z.object({
  weightKg: z.preprocess(
    (val) => (val === "" || val === undefined || (typeof val === "number" && isNaN(val)) ? undefined : Number(val)),
    z.number().min(0.1, "Weight is required").max(500)
  ),
  extraMinutes: z.preprocess(
    (val) => (val === "" || val === undefined || (typeof val === "number" && isNaN(val)) ? 0 : Number(val)),
    z.number().int().min(0).default(0)
  ),
  serviceType: z.string().min(1, "Service type is required"),
  isRush: z.boolean().default(false).optional(),
});

/** Step 3: Add-ons and Notes */
export const IntakeExtrasStepSchema = z.object({
  notes: z.string().max(500).optional(),
  initialAddOns: z.array(AddOnSchema).optional(),
  machineIds: z.array(z.number()).optional(),
});

/** Full Combined Schema for Final Submission */
export const OrderIntakeSchema = z.object({
  createdByUserId: z.string().min(1, "Staff ID is required"),
})
.merge(IntakeCustomerStepBase)
.merge(IntakeServiceStepSchema)
.merge(IntakeExtrasStepSchema)
.refine(data => data.customerId || data.customer, {
  message: "Either an existing customer must be selected or a new one registered",
  path: ["customerId"],
});

export type OrderIntakeInput = z.infer<typeof OrderIntakeSchema>;

/** Status Update Schema */
export const UpdateOrderStatusSchema = z.object({
  newStatus: z.string().min(1, "Status is required"),
  notes: z.string().max(500).optional(),
  changedByUserId: z.string().uuid("Invalid staff ID format"),
  machineIds: z.array(z.number().int().positive()).max(10, "Cannot assign more than 10 machines").optional(),
});

export type UpdateOrderStatusInput = z.infer<typeof UpdateOrderStatusSchema>;
