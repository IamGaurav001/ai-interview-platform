import { z } from "zod";

export const evaluateAnswerSchema = z.object({
  domain: z.string().min(1, "Domain is required").trim(),
  question: z.string().min(1, "Question is required").trim(),
  answer: z.string().min(1, "Answer is required").trim(),
});

export const startInterviewSchema = z.object({
  level: z.enum(["Junior", "Mid-Level", "Senior", "Lead", "Auto"]).optional(),
  jobRole: z.string().optional(),
  jobDescription: z.string().optional(),
  jobDescriptionUrl: z.string().url().optional().or(z.literal("")),
});

export const nextStepSchema = z.object({
  answer: z.string().min(10, "Answer must be at least 10 characters long").trim(),
});
