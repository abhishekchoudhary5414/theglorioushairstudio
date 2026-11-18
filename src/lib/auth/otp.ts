import crypto from "crypto";
import nodemailer from "nodemailer";
import { sql } from "@/lib/db/neon";
import { salonConfig } from "@/config/salon.config";

export interface SendOtpOptions {
  mobile?: string;
  email?: string;
  purpose: "registration" | "login" | "reset_password" | "email_verification";
}

// In-memory rate limiting map: identifier -> { count, lastAttempt }
const rateLimitMap = new Map<string, { count: number; lastAttempt: number }>();

export function checkRateLimit(key: string, maxAttempts = 5, windowMs = 60 * 1000): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(key);
  if (!entry) {
    rateLimitMap.set(key, { count: 1, lastAttempt: now });
    return true;
  }
  if (now - entry.lastAttempt > windowMs) {
    rateLimitMap.set(key, { count: 1, lastAttempt: now });
    return true;
  }
  if (entry.count >= maxAttempts) {
    return false;
  }
  entry.count += 1;
  return true;
}

/**
 * Generates a cryptographically strong 6-digit OTP
 */
export function generateNumericOtp(): string {
  const buffer = crypto.randomBytes(3);
  const num = (buffer.readUIntBE(0, 3) % 900000) + 100000;
  return num.toString();
}

/**
 * SHA-256 OTP hash (Never store OTPs in plaintext)
 */
export function hashOtp(otp: string): string {
  return crypto.createHash("sha256").update(otp).digest("hex");
}

/**
 * Send SMS OTP via external SMS provider (Fast2SMS, MSG91, Twilio or fallback simulation)
 */
export async function sendSmsOtp(mobile: string, otp: string): Promise<boolean> {
  const cleanMobile = mobile.replace(/\D/g, "").slice(-10);
  const apiKey = process.env.OTP_PROVIDER_API_KEY;

  if (apiKey) {
    try {
      // Fast2SMS standard Indian gateway integration
      const res = await fetch("https://www.fast2sms.com/dev/bulkV2", {
        method: "POST",
        headers: {
          authorization: apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          route: "otp",
          variables_values: otp,
          numbers: cleanMobile,
        }),
      });
      const data = await res.json();
      if (data.return) {
        return true;
      }
      console.warn("Fast2SMS API response:", data);
    } catch (err) {
      console.error("Error sending SMS OTP via provider:", err);
    }
  }

  // Development / sandbox console fallback log
  console.log(`\n========================================\n[SMS OTP GATEWAY] Mobile: +91-${cleanMobile} | OTP: ${otp}\n========================================\n`);
  return true;
}

/**
 * Send Email OTP via SMTP (Nodemailer) or custom email provider
 */
export async function sendEmailOtp(email: string, otp: string, purpose: string): Promise<boolean> {
  const purposeTitleMap: Record<string, string> = {
    registration: "Complete Your Registration",
    login: "Login Verification Code",
    reset_password: "Reset Your Account Password",
    email_verification: "Verify Your Email Address",
  };

  const title = purposeTitleMap[purpose] || "Verification Code";

  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === "true",
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      await transporter.sendMail({
        from: `"${salonConfig.name}" <${process.env.SMTP_USER}>`,
        to: email,
        subject: `${title} - ${otp} [${salonConfig.name}]`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 500px; margin: 0 auto; background: #ffffff; border: 1px solid #e8e1d5; border-radius: 12px; overflow: hidden;">
            <div style="background: linear-gradient(90deg, #c5a059, #e8cf96, #c5a059); height: 5px;"></div>
            <div style="padding: 24px; text-align: center;">
              <h2 style="color: #181413; margin: 0 0 10px 0;">${salonConfig.name}</h2>
              <p style="color: #69605b; font-size: 14px; margin: 0 0 20px 0;">${title}</p>
              <div style="background: #faf7f2; border: 1px dashed #c5a059; border-radius: 8px; padding: 18px; margin: 20px 0;">
                <span style="font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #c5a059;">${otp}</span>
              </div>
              <p style="color: #8c827a; font-size: 12px; margin: 15px 0 0 0;">This code is valid for 5 minutes. Please do not share it with anyone.</p>
            </div>
            <div style="background: #181413; color: #c5a059; padding: 12px; text-align: center; font-size: 11px;">
              ${salonConfig.name} &bull; ${salonConfig.address.fullAddress}
            </div>
          </div>
        `,
      });
      return true;
    } catch (err) {
      console.error("Error sending Email OTP via SMTP:", err);
    }
  }

  // Development console fallback log
  console.log(`\n========================================\n[EMAIL OTP] To: ${email} | Purpose: ${purpose} | OTP: ${otp}\n========================================\n`);
  return true;
}

/**
 * Stores an OTP in Neon PostgreSQL with 5-minute expiry and attempt limit
 */
export async function createAndSendOtp(options: SendOtpOptions): Promise<{ success: boolean; message: string; cooldownSeconds?: number }> {
  const { mobile, email, purpose } = options;
  const targetKey = (mobile ? `mobile:${mobile}` : `email:${email}`) + `:${purpose}`;

  // Rate limiting: 1 OTP request every 45 seconds cooldown, max 5 per 15 minutes
  if (!checkRateLimit(`req:${targetKey}`, 5, 15 * 60 * 1000)) {
    return { success: false, message: "Too many OTP requests. Please try again after 15 minutes." };
  }

  // Check recent unexpired OTP to enforce cooldown (45s)
  const recent = await sql`
    SELECT created_at FROM otp_verifications
    WHERE (
      (${mobile || null}::varchar IS NOT NULL AND mobile_number = ${mobile || null})
      OR (${email || null}::varchar IS NOT NULL AND LOWER(email) = LOWER(${email || null}))
    )
    AND purpose = ${purpose}
    AND verified_at IS NULL
    AND expires_at > NOW()
    ORDER BY created_at DESC
    LIMIT 1;
  `;

  if (recent.length > 0) {
    const elapsedMs = Date.now() - new Date(recent[0].created_at).getTime();
    if (elapsedMs < 45 * 1000) {
      const remaining = Math.ceil((45 * 1000 - elapsedMs) / 1000);
      return {
        success: false,
        message: `Please wait ${remaining} seconds before requesting a new OTP.`,
        cooldownSeconds: remaining,
      };
    }
  }

  const otp = generateNumericOtp();
  const otpHash = hashOtp(otp);
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes validity

  await sql`
    INSERT INTO otp_verifications (
      mobile_number, email, otp_hash, purpose, expires_at, attempts
    ) VALUES (
      ${mobile || null},
      ${email || null},
      ${otpHash},
      ${purpose},
      ${expiresAt.toISOString()},
      0
    );
  `;

  if (mobile) {
    await sendSmsOtp(mobile, otp);
  } else if (email) {
    await sendEmailOtp(email, otp, purpose);
  }

  return { success: true, message: "Verification code sent successfully." };
}

/**
 * Verify OTP securely against Neon PostgreSQL
 */
export async function verifyOtp(options: {
  mobile?: string;
  email?: string;
  otp: string;
  purpose: "registration" | "login" | "reset_password" | "email_verification";
}): Promise<{ valid: boolean; message: string }> {
  const { mobile, email, otp, purpose } = options;

  if (!otp || otp.trim().length !== 6) {
    return { valid: false, message: "Please enter a valid 6-digit verification code." };
  }

  // Allow verifying unverified OTP OR recently verified OTP within 15 minutes (for multi-step forms)
  const records = await sql`
    SELECT id, otp_hash, expires_at, attempts, verified_at
    FROM otp_verifications
    WHERE (
      (${mobile || null}::varchar IS NOT NULL AND mobile_number = ${mobile || null})
      OR (${email || null}::varchar IS NOT NULL AND LOWER(email) = LOWER(${email || null}))
    )
    AND purpose = ${purpose}
    AND (
      verified_at IS NULL
      OR verified_at >= NOW() - INTERVAL '15 minutes'
    )
    ORDER BY created_at DESC
    LIMIT 1;
  `;

  if (records.length === 0) {
    return { valid: false, message: "No verification code requested or code already expired." };
  }

  const record = records[0];

  // If already verified recently in step 1, allow proceeding
  if (record.verified_at) {
    const inputHash = hashOtp(otp.trim());
    if (inputHash === record.otp_hash) {
      return { valid: true, message: "Verification confirmed." };
    }
  }

  // Expiration check
  if (new Date(record.expires_at).getTime() < Date.now()) {
    return { valid: false, message: "Verification code has expired. Please request a new one." };
  }

  // Maximum verification attempts (5 max)
  if (record.attempts >= 5) {
    return { valid: false, message: "Maximum verification attempts exceeded. Please request a new code." };
  }

  // Increment attempts counter
  await sql`
    UPDATE otp_verifications
    SET attempts = attempts + 1
    WHERE id = ${record.id};
  `;

  const inputHash = hashOtp(otp.trim());
  if (inputHash !== record.otp_hash) {
    const remainingAttempts = 5 - (record.attempts + 1);
    return {
      valid: false,
      message: remainingAttempts > 0
        ? `Incorrect code. ${remainingAttempts} attempts remaining.`
        : "Incorrect code. Maximum verification attempts reached.",
    };
  }

  // Mark as verified
  await sql`
    UPDATE otp_verifications
    SET verified_at = NOW()
    WHERE id = ${record.id};
  `;

  return { valid: true, message: "Verification successful." };
}
