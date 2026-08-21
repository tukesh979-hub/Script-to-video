import { z } from "zod";

// Server-side validation for every auth form. Client-side HTML5 validation
// (required/type=email) is just UX -- this is what actually enforces shape,
// since a request can always bypass the browser entirely.
const emailSchema = z.string().trim().min(1, "Email is required.").email("Enter a valid email address.");

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters.")
  .regex(/[a-zA-Z]/, "Password must contain at least one letter.")
  .regex(/[0-9]/, "Password must contain at least one number.");

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required."),
});

export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export const resetPasswordRequestSchema = z.object({
  email: emailSchema,
});

export const resetPasswordConfirmSchema = z.object({
  password: passwordSchema,
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
