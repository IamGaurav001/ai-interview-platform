import Razorpay from "razorpay";
import crypto from "crypto";
import User from "../models/User.js";
import Transaction from "../models/Transaction.js";
import dotenv from "dotenv";

dotenv.config();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export const createOrder = async (req, res) => {
  try {
    const { planId } = req.body;
    let amount, credits;

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
        planId: planId || "1_interview",
      },
    };

    const order = await razorpay.orders.create(options);

    res.json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("Create order error:", error);
    res.status(500).json({ success: false, message: "Failed to create order" });
  }
};



export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac(
        "sha256",
        process.env.RAZORPAY_KEY_SECRET
      )
      .update(body.toString())
      .digest("hex");

    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
      // Check for duplicate transaction
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

      // Record transaction
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
      res.status(400).json({
        success: false,
        message: "Invalid signature",
      });
    }
  } catch (error) {
    console.error("Verify payment error:", error);
    res
      .status(500)
      .json({ success: false, message: "Payment verification failed" });
  }
};
