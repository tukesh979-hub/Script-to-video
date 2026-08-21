import { z } from "zod";

export const onboardingSchema = z.object({
  displayName: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters.")
    .max(60, "Name must be under 60 characters."),
});
