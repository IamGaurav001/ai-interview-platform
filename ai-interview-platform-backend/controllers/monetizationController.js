import Razorpay from "razorpay";
import crypto from "crypto";
import User from "../models/User.js";
import Transaction from "../models/Transaction.js";
import dotenv from "dotenv";
import { createOrderSchema, verifyPaymentSchema } from "../validators/monetizationValidators.js";

dotenv.config();

if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  console.error("❌ RAZORPAY credentials not configured in environment variables");
}

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export const createOrder = async (req, res) => {
  try {
    // OWASP Security: Strict input validation
    const validation = createOrderSchema.safeParse(req.body);
    
    if (!validation.success) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid plan selection",
        error: validation.error.errors?.[0]?.message || "Invalid input data" 
      });
    }

    const { planId } = validation.data;
    let amount, credits;

    // Whitelist-based plan selection (OWASP recommendation)
    switch (planId) {
      case "3_interviews":
        amount = 4900;
        credits = 3;
        break;
      case "1_interview":
      default:
        amount = 1900; 
        credits = 1;
        break;
    }

    const options = {
      amount,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
      notes: {
        credits: credits, 
        planId: planId,
        userId: req.user._id.toString(),
      },
    };

    const order = await razorpay.orders.create(options);

    res.json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("Create order error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to create order",
      ...(process.env.NODE_ENV === 'development' && { details: error.message })
    });
  }
};



export const verifyPayment = async (req, res) => {
  try {
    // OWASP Security: Strict input validation
    const validation = verifyPaymentSchema.safeParse(req.body);
    
    if (!validation.success) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid payment data",
        error: validation.error.errors?.[0]?.message || "Invalid input data" 
      });
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = validation.data;

    // OWASP Security: Verify signature using constant-time comparison
    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac(
        "sha256",
        process.env.RAZORPAY_KEY_SECRET
      )
      .update(body.toString())
      .digest("hex");

    // Use crypto.timingSafeEqual to prevent timing attacks
    const isAuthentic = crypto.timingSafeEqual(
      Buffer.from(expectedSignature, 'hex'),
      Buffer.from(razorpay_signature, 'hex')
    );

    if (isAuthentic) {
      // OWASP Security: Idempotency check to prevent double-processing
      const existingTransaction = await Transaction.findOne({
        orderId: razorpay_order_id,
        status: "success",
      });

      if (existingTransaction) {
        return res.status(200).json({
          success: true,
          message: "Payment already processed",
        });
      }

      const order = await razorpay.orders.fetch(razorpay_order_id);
      const creditsToAdd = parseInt(order.notes.credits) || 1;

      const user = await User.findById(req.user._id);

      if (!user.usage) {
        user.usage = {
          freeInterviewsLeft: 0,
          lastMonthlyReset: new Date(),
          purchasedCredits: 0,
        };
      }

      user.usage.purchasedCredits =
        (user.usage.purchasedCredits || 0) + creditsToAdd;
      await user.save();

      // Create transaction record
      await Transaction.create({
        userId: req.user._id,
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
        amount: order.amount,
        status: "success",
        creditsAdded: creditsToAdd,
        planId: order.notes.planId,
      });

      res.json({
        success: true,
        message: `Payment verified and ${creditsToAdd} credit(s) added`,
      });
    } else {
      // OWASP Security: Log failed verification attempts for monitoring
      console.warn(`⚠️ Invalid payment signature attempt for order: ${razorpay_order_id}`);
      
      res.status(400).json({
        success: false,
        message: "Invalid signature",
      });
    }
  } catch (error) {
    console.error("Verify payment error:", error);
    res
      .status(500)
      .json({ 
        success: false, 
        message: "Payment verification failed",
        // Don't expose internal error details in production
        ...(process.env.NODE_ENV === 'development' && { details: error.message })
      });
  }
};

export const getTransactionHistory = async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.user._id })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      transactions,
    });
  } catch (error) {
    console.error("Get transaction history error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch transaction history" });
  }
};
