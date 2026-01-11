import { z } from "zod";

const objectIdRegex = /^[a-f0-9]{24}$/i;

export const useExistingResumeSchema = z.object({
  resumeId: z
    .string()
    .min(1, "Resume ID is required")
    .max(24, "Invalid resume ID length")
    .regex(objectIdRegex, "Invalid resume ID format"),
});

export const deleteResumeSchema = z.object({
  id: z
    .string()
    .min(1, "Resume ID is required")
    .max(24, "Invalid resume ID length")
    .regex(objectIdRegex, "Invalid resume ID format"),
});
