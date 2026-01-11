import { z } from "zod";

const ALLOWED_PLAN_IDS = ["1_interview", "3_interviews"];

export const createOrderSchema = z.object({
  planId: z
    .string()
    .refine((val) => ALLOWED_PLAN_IDS.includes(val), {
      message: `Plan ID must be one of: ${ALLOWED_PLAN_IDS.join(", ")}`,
    }),
});

export const verifyPaymentSchema = z.object({
  razorpay_order_id: z
    .string()
    .min(1, "Order ID is required")
    .max(100, "Order ID too long")
    .regex(/^[a-zA-Z0-9_-]+$/, "Invalid order ID format"),
  razorpay_payment_id: z
    .string()
    .min(1, "Payment ID is required")
    .max(100, "Payment ID too long")
    .regex(/^[a-zA-Z0-9_-]+$/, "Invalid payment ID format"),
  razorpay_signature: z
    .string()
    .min(1, "Signature is required")
    .max(200, "Signature too long")
    .regex(/^[a-f0-9]+$/, "Invalid signature format"),
});
