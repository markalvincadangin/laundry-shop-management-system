import { z } from "zod";

export const LoginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type LoginInput = z.infer<typeof LoginSchema>;

export const AuthResponseSchema = z.object({
  accessToken: z.string(),
  expiresIn: z.number(),
});

export type AuthResponse = z.infer<typeof AuthResponseSchema>;
