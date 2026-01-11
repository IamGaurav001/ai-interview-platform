import { z } from "zod";

/**
 * OWASP Input Validation: Interview Validators
 * - Strict type checking and length limits
 * - Sanitization of user inputs
 * - URL validation for external resources
 * - Reject unexpected fields
 */

// Domain validation: alphanumeric + common separators, max 100 chars
export const evaluateAnswerSchema = z
  .object({
    domain: z
      .string()
      .min(1, "Domain is required")
      .max(100, "Domain must be less than 100 characters")
      .regex(
        /^[a-zA-Z0-9\s\-_./]+$/,
        "Domain contains invalid characters"
      )
      .trim(),
    question: z
      .string()
      .min(1, "Question is required")
      .max(2000, "Question must be less than 2000 characters")
      .trim(),
    answer: z
      .string()
      .min(1, "Answer is required")
      .max(5000, "Answer must be less than 5000 characters")
      .trim(),
  })
  .strict(); // Reject unexpected fields

// Start interview validation with strict limits
export const startInterviewSchema = z
  .object({
    level: z.enum(["Junior", "Mid-Level", "Senior", "Lead", "Auto"]).optional(),
    jobRole: z
      .string()
      .optional()
      .transform(val => val === "" ? undefined : val)
      .refine(
        (val) => {
          if (!val) return true; // Allow undefined/empty
          return val.length <= 200;
        },
        { message: "Job role must be less than 200 characters" }
      )
      .refine(
        (val) => {
          if (!val) return true; // Allow undefined/empty
          return /^[a-zA-Z0-9\s\-/()&,.]+$/.test(val);
        },
        { message: "Job role contains invalid characters" }
      ),
    jobDescription: z
      .string()
      .optional()
      .transform(val => val === "" ? undefined : val)
      .refine(
        (val) => {
          if (!val) return true; // Allow undefined/empty
          return val.length <= 10000;
        },
        { message: "Job description must be less than 10000 characters" }
      ),
    jobDescriptionUrl: z
      .string()
      .optional()
      .transform(val => val === "" ? undefined : val)
      .refine(
        (val) => {
          // Allow empty/undefined
          if (!val) return true;
          
          // Validate URL format
          try {
            const parsed = new URL(val);
            // Only allow http and https protocols
            return ["http:", "https:"].includes(parsed.protocol);
          } catch {
            return false;
          }
        },
        { message: "Invalid URL format. Only HTTP and HTTPS URLs are allowed" }
      ),
  })
  .strict(); // Reject unexpected fields

// Next step validation
export const nextStepSchema = z
  .object({
    answer: z
      .string()
      .min(10, "Answer must be at least 10 characters long")
      .max(5000, "Answer must be less than 5000 characters")
      .trim(),
  })
  .strict(); // Reject unexpected fields

// Save session validation
export const saveSessionSchema = z
  .object({
    domain: z
      .string()
      .min(1, "Domain is required")
      .max(100, "Domain must be less than 100 characters")
      .trim(),
    questions: z
      .array(z.string().max(2000, "Question too long"))
      .min(1, "At least one question is required")
      .max(50, "Too many questions"),
    answers: z
      .array(z.string().max(5000, "Answer too long"))
      .min(1, "At least one answer is required")
      .max(50, "Too many answers"),
    feedbacks: z
      .array(
        z.object({
          correctness: z.number().min(0).max(10).optional(),
          clarity: z.number().min(0).max(10).optional(),
          confidence: z.number().min(0).max(10).optional(),
          overall_feedback: z.string().max(1000).optional(),
        })
      )
      .optional(),
    scores: z.array(z.number().min(0).max(10)).optional(),
  })
  .strict()
  .refine((data) => data.questions.length === data.answers.length, {
    message: "Number of questions must match number of answers",
  });
