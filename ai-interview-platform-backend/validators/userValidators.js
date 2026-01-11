import { z } from "zod";

export const nameSchema = z
  .string()
  .min(1, "Name is required")
  .max(100, "Name must be less than 100 characters")
  .regex(
    /^[a-zA-Z0-9\s\-'.]+$/,
    "Name can only contain letters, numbers, spaces, hyphens, apostrophes, and periods"
  )
  .trim();

export const updateProfileSchema = z.object({
  name: nameSchema.optional(),
  hasCompletedOnboarding: z.boolean().optional(),
  notifications: z
    .object({
      email: z.boolean().optional(),
      push: z.boolean().optional(),
      sms: z.boolean().optional(),
    })
    .strict()
    .optional(),
});

export const strictUpdateProfileSchema = updateProfileSchema.strict();
