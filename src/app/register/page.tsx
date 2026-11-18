"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";
import PersonIcon from "@mui/icons-material/Person";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import GoogleIcon from "@mui/icons-material/Google";
import CardGiftcardIcon from "@mui/icons-material/CardGiftcard";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { salonConfig } from "@/config/salon.config";
import styles from "../login/Auth.module.css";

export default function RegisterPage() {
  // Step 1: Email OTP dispatch & verify; Step 2: Customer Name, Password & Confirm Password
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  // Profile fields for Step 2
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  React.useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  // Step 1A: Send verification OTP to email
  const handleSendEmailOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!cleanEmail || !emailRegex.test(cleanEmail)) {
      setErrorMsg("Please enter a valid Gmail / Email address.");
      return;
    }

    setErrorMsg("");
    setSuccessMsg("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: cleanEmail, purpose: "registration" }),
      });
      const data = await res.json();

      if (data.success) {
        setOtpSent(true);
        setCooldown(45);
        setSuccessMsg(`Verification code sent to ${cleanEmail}. Please enter code below.`);
      } else {
        setErrorMsg(data.message || "Failed to send verification code.");
      }
    } catch {
      setErrorMsg("Unable to send OTP. Please check your connection.");
    } finally {
      setIsLoading(false);
    }
  };

  // Step 1B: Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanOtp = otp.trim().replace(/\D/g, "");
    if (!cleanOtp || cleanOtp.length !== 6) {
      setErrorMsg("Please enter the 6-digit verification code.");
      return;
    }

    setErrorMsg("");
    setSuccessMsg("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          otp: cleanOtp,
          purpose: "registration",
        }),
      });
      const data = await res.json();

      if (data.success) {
        setSuccessMsg("Email verified successfully! Now set your name and password.");
        setStep(2);
      } else {
        setErrorMsg(data.message || "Invalid or expired verification code.");
      }
    } catch {
      setErrorMsg("Verification request failed.");
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Finalize Registration and Log In
  const handleFinalRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!fullName.trim()) {
      setErrorMsg("Please enter your full name.");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters long.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fullName.trim(),
          email: email.trim().toLowerCase(),
          password,
          otp: otp.trim(),
        }),
      });
      const data = await res.json();

      if (data.success) {
        setSuccessMsg("Account created! Logging in to your salon sanctuary...");
        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 700);
      } else {
        setErrorMsg(data.message || "Registration failed.");
      }
    } catch {
      setErrorMsg("Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Google OAuth flow
  const handleGoogleSignUp = async () => {
    setIsLoading(true);
    setErrorMsg("");
    try {
      const input = prompt("Enter your Google Account email for instant sign up:") || "";
      if (!input) {
        setIsLoading(false);
        return;
      }
      const res = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: input.trim().toLowerCase(),
          name: input.split("@")[0],
          sub: `google_${Date.now()}`,
        }),
      });
      const data = await res.json();
      if (data.success) {
        window.location.href = "/dashboard";
      } else {
        setErrorMsg(data.message || "Google registration failed.");
      }
    } catch {
      setErrorMsg("Google authentication error.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <Header />
      <main className={styles.authMain}>
        {/* Soft Ambient Golden Backlights */}
        <div className={styles.ambientAuraTop} />
        <div className={styles.ambientAuraBottom} />

        <div className={styles.luxuryCard}>
          {/* Left Brand Showcase Column */}
          <div className={styles.brandSide}>
            <div className={styles.brandTop}>
              <div className={styles.brandLogoBadge}>
                <Image
                  src={salonConfig.logo}
                  alt={salonConfig.name}
                  width={46}
                  height={46}
                  priority
                  style={{ objectFit: "cover" }}
                />
              </div>
              <span className={styles.brandTagline}>Privilege Member Registration</span>
              <h2 className={styles.brandHeading}>
                Join the <span>couture</span> salon circle.
              </h2>
              <p className={styles.brandDesc}>
                Register your email in two quick steps to unlock instant appointment booking, reward wallet privileges, and VIP discounts.
              </p>

              <ul className={styles.perksList}>
                <li className={styles.perkItem}>
                  <div className={styles.perkIconWrapper}>
                    <CardGiftcardIcon fontSize="inherit" />
                  </div>
                  <span>10 Loyalty points on every ₹100 spent</span>
                </li>
                <li className={styles.perkItem}>
                  <div className={styles.perkIconWrapper}>
                    <CalendarMonthIcon fontSize="inherit" />
                  </div>
                  <span>Quick booking with master salon stylists</span>
                </li>
                <li className={styles.perkItem}>
                  <div className={styles.perkIconWrapper}>
                    <VerifiedUserIcon fontSize="inherit" />
                  </div>
                  <span>Verified email access with password protection</span>
                </li>
              </ul>
            </div>

            <div className={styles.brandFooterQuote}>
              <strong>The Glorious Hair Studio</strong> &bull; Scheme No 78, Vijay Nagar, Indore
            </div>
          </div>

          {/* Right Interactive Registration Column */}
          <div className={styles.formSide}>
            <div className={styles.formHeader}>
              <span className={styles.eyebrowText}>
                {step === 1 ? "Step 1 of 2: Email Verification" : "Step 2 of 2: Account Security"}
              </span>
              <h1 className={styles.formTitle}>
                {step === 1 ? "Verify Your Email" : "Create Account Password"}
              </h1>
              <p className={styles.formSubtitle}>
                {step === 1
                  ? "Enter your Gmail to receive a 6-digit confirmation code."
                  : `Verified: ${email}. Enter your name and password to complete registration.`}
              </p>
            </div>

            {/* Alerts */}
            {errorMsg && (
              <div className={styles.errorAlert}>
                <ErrorIcon fontSize="small" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className={styles.successAlert}>
                <CheckCircleIcon fontSize="small" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Step 1: Email Input + OTP Verification */}
            {step === 1 ? (
              !otpSent ? (
                <form onSubmit={handleSendEmailOtp}>
                  <div className={styles.formGroup}>
                    <div className={styles.labelRow}>
                      <label className={styles.label}>Gmail / Email Address *</label>
                    </div>
                    <div className={styles.inputContainer}>
                      <input
                        type="email"
                        className={styles.inputField}
                        placeholder="e.g. yourname@gmail.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        autoFocus
                        required
                      />
                      <EmailIcon className={styles.leadingIcon} />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || !email.trim()}
                    className={styles.goldSubmitBtn}
                  >
                    <span>{isLoading ? "Sending Code to Email..." : "Send Verification OTP"}</span>
                    <ArrowForwardIcon fontSize="small" />
                  </button>

                  <div className={styles.orDivider}>
                    <span>or sign up with</span>
                  </div>

                  <button type="button" onClick={handleGoogleSignUp} className={styles.socialGoogleBtn}>
                    <GoogleIcon fontSize="small" style={{ color: "#4285F4" }} />
                    <span>Continue with Google</span>
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp}>
                  <div className={styles.formGroup}>
                    <div className={styles.labelRow}>
                      <label className={styles.label}>Target Email</label>
                      <button
                        type="button"
                        onClick={() => {
                          setOtpSent(false);
                          setOtp("");
                          setErrorMsg("");
                        }}
                        className={styles.forgotLink}
                      >
                        Change Email
                      </button>
                    </div>
                    <div className={styles.inputContainer}>
                      <input
                        type="email"
                        className={styles.inputField}
                        value={email}
                        disabled
                        style={{ background: "#f0ebe1", cursor: "not-allowed" }}
                      />
                      <EmailIcon className={styles.leadingIcon} />
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <div className={styles.labelRow}>
                      <label className={styles.label}>Enter 6-Digit Email OTP *</label>
                    </div>
                    <div className={styles.inputContainer}>
                      <input
                        type="text"
                        maxLength={6}
                        className={styles.inputField}
                        placeholder="&bull;&bull;&bull;&bull;&bull;&bull;"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                        style={{ letterSpacing: "0.28em", fontWeight: 700, fontSize: "1.2rem", textAlign: "center" }}
                        autoFocus
                        required
                      />
                      <LockIcon className={styles.leadingIcon} />
                    </div>
                    {cooldown > 0 ? (
                      <p className={styles.cooldownHint}>Resend code in {cooldown}s</p>
                    ) : (
                      <p className={styles.cooldownHint}>
                        Didn't get the email? Check Spam or{" "}
                        <span className={styles.resendActive} onClick={() => handleSendEmailOtp()}>
                          Resend OTP
                        </span>
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || otp.length !== 6}
                    className={styles.goldSubmitBtn}
                  >
                    <span>{isLoading ? "Verifying..." : "Verify OTP & Continue"}</span>
                    <ArrowForwardIcon fontSize="small" />
                  </button>
                </form>
              )
            ) : (
              /* Step 2: Name + Password Creation */
              <form onSubmit={handleFinalRegister}>
                <div className={styles.formGroup}>
                  <div className={styles.labelRow}>
                    <label className={styles.label}>Your Full Name *</label>
                  </div>
                  <div className={styles.inputContainer}>
                    <input
                      type="text"
                      className={styles.inputField}
                      placeholder="e.g. Priya Sharma"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      autoFocus
                      required
                    />
                    <PersonIcon className={styles.leadingIcon} />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <div className={styles.labelRow}>
                    <label className={styles.label}>Create Password *</label>
                  </div>
                  <div className={styles.inputContainer}>
                    <input
                      type="password"
                      className={styles.inputField}
                      placeholder="Minimum 6 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <LockIcon className={styles.leadingIcon} />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <div className={styles.labelRow}>
                    <label className={styles.label}>Confirm Password *</label>
                  </div>
                  <div className={styles.inputContainer}>
                    <input
                      type="password"
                      className={styles.inputField}
                      placeholder="Re-enter your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                    <LockIcon className={styles.leadingIcon} />
                  </div>
                </div>

                <button type="submit" disabled={isLoading} className={styles.goldSubmitBtn}>
                  <span>{isLoading ? "Creating Account..." : "Complete Registration & Sign In"}</span>
                  <ArrowForwardIcon fontSize="small" />
                </button>
              </form>
            )}

            <div className={styles.authFooter}>
              <span>Already registered?</span>
              <Link href="/login" className={styles.authHighlightLink}>
                Sign In directly
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
