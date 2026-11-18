import Razorpay from "razorpay";
import crypto from "crypto";

// Server-side Razorpay instance initializer
export function getRazorpayClient() {
  const key_id = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_placeholder";
  const key_secret = process.env.RAZORPAY_KEY_SECRET || "rzp_secret_placeholder";

  return new Razorpay({
    key_id,
    key_secret,
  });
}

/**
 * Verify Razorpay standard checkout payment signature
 */
export function verifyRazorpaySignature(options: {
  orderId: string;
  paymentId: string;
  signature: string;
}): boolean {
  const { orderId, paymentId, signature } = options;
  const key_secret = process.env.RAZORPAY_KEY_SECRET || "rzp_secret_placeholder";

  const generatedSignature = crypto
    .createHmac("sha256", key_secret)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");

  return generatedSignature === signature;
}

/**
 * Verify Razorpay webhook signature
 */
export function verifyRazorpayWebhookSignature(
  rawBody: string,
  webhookSignature: string
): boolean {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.warn("RAZORPAY_WEBHOOK_SECRET is not configured.");
    return false;
  }

  const expectedSignature = crypto
    .createHmac("sha256", webhookSecret)
    .update(rawBody)
    .digest("hex");

  return expectedSignature === webhookSignature;
}
