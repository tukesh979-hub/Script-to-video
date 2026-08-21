import { z } from "zod";

export const createProjectSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters.").max(120, "Name must be under 120 characters."),
  description: z.string().trim().max(2000, "Description must be under 2000 characters.").optional(),
});
