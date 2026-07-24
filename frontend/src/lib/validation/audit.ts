import { z } from "zod";

export const auditLogSchema = z.object({
  id: z.string().uuid(),
  actor: z.string().nullable().optional(),
  operation: z.string(),
  entityType: z.string(),
  entityId: z.string(),
  oldState: z.record(z.string(), z.unknown()).nullable().optional(),
  newState: z.record(z.string(), z.unknown()).nullable().optional(),
  ipAddress: z.string().nullable().optional(),
  userAgent: z.string().nullable().optional(),
  status: z.string().nullable().optional(),
  methodName: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  createdAt: z.string(),
});

export type AuditLog = z.infer<typeof auditLogSchema>;

export const auditLogResponseSchema = z.object({
  content: z.array(auditLogSchema),
  pageable: z.any().optional(),
  last: z.boolean(),
  totalElements: z.number(),
  totalPages: z.number(),
  first: z.boolean(),
  size: z.number(),
  number: z.number(),
  sort: z.any().optional(),
  numberOfElements: z.number(),
  empty: z.boolean(),
});

export type AuditLogPageResponse = z.infer<typeof auditLogResponseSchema>;
