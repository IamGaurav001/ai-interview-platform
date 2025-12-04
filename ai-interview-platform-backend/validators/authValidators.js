import { z } from "zod";

export const passwordResetSchema = z.object({
  email: z.string().email("Invalid email address").min(1, "Email is required"),
});
