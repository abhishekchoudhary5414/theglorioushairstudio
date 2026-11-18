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
import CardGiftcardIcon from "@mui/icons-material/CardGiftcard";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { salonConfig } from "@/config/salon.config";
import styles from "./Auth.module.css";

export default function LoginPage() {
  // Mode: "signin" vs "signup"
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");

  // Sign In State
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Sign Up State
  const [signupStep, setSignupStep] = useState<1 | 2>(1);
  const [signupEmail, setSignupEmail] = useState("");
  const [signupOtp, setSignupOtp] = useState("");
  const [signupOtpSent, setSignupOtpSent] = useState(false);
  const [signupCooldown, setSignupCooldown] = useState(0);

  const [signupName, setSignupName] = useState("");
  const [signupPhone, setSignupPhone] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupConfirmPassword, setSignupConfirmPassword] = useState("");
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showSignupConfirmPassword, setShowSignupConfirmPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Countdown timer for OTP cooldown
  React.useEffect(() => {
    if (signupCooldown <= 0) return;
    const timer = setInterval(() => setSignupCooldown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [signupCooldown]);

  // Switch between tabs
  const handleSwitchMode = (mode: "signin" | "signup") => {
    setAuthMode(mode);
    setErrorMsg("");
    setSuccessMsg("");
    if (mode === "signup") {
      setSignupStep(1);
      setSignupOtpSent(false);
      setSignupOtp("");
    }
  };

  // 1. Handle Sign In with Password
  const handlePasswordSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = loginEmail.trim().toLowerCase();
    if (!cleanEmail || !loginPassword) {
      setErrorMsg("Please enter both your email address and password.");
      return;
    }

    setErrorMsg("");
    setSuccessMsg("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: cleanEmail, password: loginPassword }),
      });
      const data = await res.json();

      if (data.success) {
        setSuccessMsg("Welcome back! Redirecting...");
        setTimeout(() => {
          const redirectParam = new URLSearchParams(window.location.search).get("redirect");
          window.location.href = redirectParam || "/dashboard";
        }, 600);
      } else {
        setErrorMsg(data.message || "Invalid email or password.");
      }
    } catch {
      setErrorMsg("Unable to connect to the salon server. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // 2A. Sign Up: Send OTP to Email
  const handleSendSignupOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanEmail = signupEmail.trim().toLowerCase();
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
        setSignupOtpSent(true);
        setSignupCooldown(45);
        setSuccessMsg(`Verification code sent to ${cleanEmail}. Please enter code below.`);
      } else {
        setErrorMsg(data.message || "Failed to send verification code.");
      }
    } catch {
      setErrorMsg("Failed to dispatch verification code.");
    } finally {
      setIsLoading(false);
    }
  };

  // 2B. Sign Up: Verify OTP (Step 1 -> Step 2)
  const handleVerifySignupOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanOtp = signupOtp.trim().replace(/\D/g, "");
    if (!cleanOtp || cleanOtp.length !== 6) {
      setErrorMsg("Please enter the complete 6-digit OTP code.");
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
          email: signupEmail.trim().toLowerCase(),
          otp: cleanOtp,
          purpose: "registration",
        }),
      });
      const data = await res.json();

      if (data.success) {
        setSuccessMsg("Email verified! Now enter your name and choose a secure password.");
        setSignupStep(2);
      } else {
        setErrorMsg(data.message || "Invalid or expired code.");
      }
    } catch {
      setErrorMsg("Verification request failed.");
    } finally {
      setIsLoading(false);
    }
  };

  // 2C. Sign Up: Complete Registration
  const handleCompleteSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!signupName.trim()) {
      setErrorMsg("Please enter your full name.");
      return;
    }
    const cleanPhone = signupPhone.replace(/\D/g, "");
    if (!cleanPhone || cleanPhone.length < 10) {
      setErrorMsg("Please enter a valid 10-digit mobile number.");
      return;
    }
    if (signupPassword !== signupConfirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }
    if (signupPassword.length < 6) {
      setErrorMsg("Password must be at least 6 characters long.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: signupName.trim(),
          email: signupEmail.trim().toLowerCase(),
          mobileNumber: cleanPhone.slice(-10),
          password: signupPassword,
          otp: signupOtp.trim(),
        }),
      });
      const data = await res.json();

      if (data.success) {
        setSuccessMsg("Account registered successfully! Redirecting...");
        setTimeout(() => {
          const redirectParam = new URLSearchParams(window.location.search).get("redirect");
          window.location.href = redirectParam || "/dashboard";
        }, 600);
      } else {
        setErrorMsg(data.message || "Registration failed.");
      }
    } catch {
      setErrorMsg("Registration failed. Please try again.");
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
              <span className={styles.brandTagline}>Privilege Member Sanctuary</span>
              <h2 className={styles.brandHeading}>
                Indulge in <span>unrivalled</span> salon luxury.
              </h2>
              <p className={styles.brandDesc}>
                Sign in to manage appointments, redeem exclusive loyalty rewards, and experience couture hair &amp; beauty care.
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
                  <span>Priority slot booking with master stylists</span>
                </li>
                <li className={styles.perkItem}>
                  <div className={styles.perkIconWrapper}>
                    <VerifiedUserIcon fontSize="inherit" />
                  </div>
                  <span>Direct Razorpay online checkout with instant slips</span>
                </li>
              </ul>
            </div>

            <div className={styles.brandFooterQuote}>
              <strong>The Glorious Hair Studio</strong> &bull; Scheme No 78, Vijay Nagar, Indore
            </div>
          </div>

          {/* Right Interactive Form Column */}
          <div className={styles.formSide}>
            {/* Header Switcher: Sign In vs Sign Up */}
            <div className={styles.formHeader}>
              <span className={styles.eyebrowText}>
                {authMode === "signin"
                  ? "Welcome Back"
                  : signupStep === 1
                  ? "New Membership • Step 1"
                  : "New Membership • Step 2"}
              </span>
              <h1 className={styles.formTitle}>
                {authMode === "signin"
                  ? "Client Sign In"
                  : signupStep === 1
                  ? "Verify Your Email"
                  : "Set Your Password"}
              </h1>
              <p className={styles.formSubtitle}>
                {authMode === "signin"
                  ? "Enter your registered email and password to access your account."
                  : signupStep === 1
                  ? "Enter your Gmail to receive a 6-digit confirmation code."
                  : `Verified: ${signupEmail}. Set your name and password to complete registration.`}
              </p>
            </div>

            {/* Top Pill Tab Switcher */}
            <div className={styles.tabSwitchGroup}>
              <button
                type="button"
                className={`${styles.tabSwitchBtn} ${authMode === "signin" ? styles.tabSwitchBtnActive : ""}`}
                onClick={() => handleSwitchMode("signin")}
              >
                <LockIcon fontSize="small" />
                <span>Sign In</span>
              </button>
              <button
                type="button"
                className={`${styles.tabSwitchBtn} ${authMode === "signup" ? styles.tabSwitchBtnActive : ""}`}
                onClick={() => handleSwitchMode("signup")}
              >
                <PersonIcon fontSize="small" />
                <span>Sign Up</span>
              </button>
            </div>

            {/* Feedback Alerts */}
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

            {/* TAB 1: SIGN IN */}
            {authMode === "signin" && (
              <form onSubmit={handlePasswordSignIn}>
                <div className={styles.formGroup}>
                  <div className={styles.labelRow}>
                    <label className={styles.label}>Gmail / Email Address</label>
                  </div>
                  <div className={styles.inputContainer}>
                    <input
                      type="email"
                      className={styles.inputField}
                      placeholder="e.g. yourname@gmail.com"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      autoFocus
                      required
                    />
                    <EmailIcon className={styles.leadingIcon} />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <div className={styles.labelRow}>
                    <label className={styles.label}>Password</label>
                    <Link href="/forgot-password" className={styles.forgotLink}>
                      Forgot Password?
                    </Link>
                  </div>
                  <div className={styles.inputContainer}>
                    <input
                      type={showLoginPassword ? "text" : "password"}
                      className={styles.inputField}
                      placeholder="Enter your account password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required
                    />
                    <LockIcon className={styles.leadingIcon} />
                    <button
                      type="button"
                      className={styles.trailingIconButton}
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      aria-label={showLoginPassword ? "Hide password" : "Show password"}
                    >
                      {showLoginPassword ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                    </button>
                  </div>
                </div>

                <button type="submit" disabled={isLoading} className={styles.goldSubmitBtn}>
                  <span>{isLoading ? "Signing in..." : "Sign In to Account"}</span>
                  <ArrowForwardIcon fontSize="small" />
                </button>
              </form>
            )}

            {/* TAB 2: SIGN UP */}
            {authMode === "signup" && signupStep === 1 && (
              !signupOtpSent ? (
                <form onSubmit={handleSendSignupOtp}>
                  <div style={{
                    marginBottom: "1.25rem",
                    padding: "0.85rem 1rem",
                    background: "rgba(197, 160, 89, 0.12)",
                    border: "1px solid var(--color-border-gold)",
                    borderRadius: "8px",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    color: "var(--color-primary)"
                  }}>
                    <CardGiftcardIcon style={{ color: "var(--color-secondary)" }} fontSize="small" />
                    <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>
                      Join today and get <strong>10 Free Loyalty Points</strong> credited instantly to your wallet!
                    </span>
                  </div>

                  <div className={styles.formGroup}>
                    <div className={styles.labelRow}>
                      <label className={styles.label}>Gmail / Email Address *</label>
                    </div>
                    <div className={styles.inputContainer}>
                      <input
                        type="email"
                        className={styles.inputField}
                        placeholder="e.g. yourname@gmail.com"
                        value={signupEmail}
                        onChange={(e) => setSignupEmail(e.target.value)}
                        autoFocus
                        required
                      />
                      <EmailIcon className={styles.leadingIcon} />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || !signupEmail.trim()}
                    className={styles.goldSubmitBtn}
                  >
                    <span>{isLoading ? "Sending Code to Email..." : "Send Verification OTP"}</span>
                    <ArrowForwardIcon fontSize="small" />
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifySignupOtp}>
                  <div className={styles.formGroup}>
                    <div className={styles.labelRow}>
                      <label className={styles.label}>Email Address</label>
                      <button
                        type="button"
                        onClick={() => {
                          setSignupOtpSent(false);
                          setSignupOtp("");
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
                        value={signupEmail}
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
                        value={signupOtp}
                        onChange={(e) => setSignupOtp(e.target.value.replace(/\D/g, ""))}
                        style={{ letterSpacing: "0.28em", fontWeight: 700, fontSize: "1.2rem", textAlign: "center" }}
                        autoFocus
                        required
                      />
                      <LockIcon className={styles.leadingIcon} />
                    </div>
                    {signupCooldown > 0 ? (
                      <p className={styles.cooldownHint}>Resend code in {signupCooldown}s</p>
                    ) : (
                      <p className={styles.cooldownHint}>
                        Didn't get the email? Check Spam or{" "}
                        <span className={styles.resendActive} onClick={() => handleSendSignupOtp()}>
                          Resend OTP
                        </span>
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || signupOtp.length !== 6}
                    className={styles.goldSubmitBtn}
                  >
                    <span>{isLoading ? "Verifying..." : "Verify OTP & Continue"}</span>
                    <ArrowForwardIcon fontSize="small" />
                  </button>
                </form>
              )
            )}

            {authMode === "signup" && signupStep === 2 && (
              <form onSubmit={handleCompleteSignup}>
                <div className={styles.formGroup}>
                  <div className={styles.labelRow}>
                    <label className={styles.label}>Full Name *</label>
                  </div>
                  <div className={styles.inputContainer}>
                    <input
                      type="text"
                      className={styles.inputField}
                      placeholder="e.g. Priya Sharma"
                      value={signupName}
                      onChange={(e) => setSignupName(e.target.value)}
                      autoFocus
                      required
                    />
                    <PersonIcon className={styles.leadingIcon} />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <div className={styles.labelRow}>
                    <label className={styles.label}>Mobile Phone Number *</label>
                  </div>
                  <div className={styles.inputContainer}>
                    <input
                      type="tel"
                      maxLength={10}
                      className={styles.inputField}
                      placeholder="10-digit mobile number (e.g. 9876543210)"
                      value={signupPhone}
                      onChange={(e) => setSignupPhone(e.target.value.replace(/\D/g, ""))}
                      required
                    />
                    <VerifiedUserIcon className={styles.leadingIcon} />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <div className={styles.labelRow}>
                    <label className={styles.label}>Create Password *</label>
                  </div>
                  <div className={styles.inputContainer}>
                    <input
                      type={showSignupPassword ? "text" : "password"}
                      className={styles.inputField}
                      placeholder="Minimum 6 characters"
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      required
                    />
                    <LockIcon className={styles.leadingIcon} />
                    <button
                      type="button"
                      className={styles.trailingIconButton}
                      onClick={() => setShowSignupPassword(!showSignupPassword)}
                      aria-label={showSignupPassword ? "Hide password" : "Show password"}
                    >
                      {showSignupPassword ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                    </button>
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <div className={styles.labelRow}>
                    <label className={styles.label}>Confirm Password *</label>
                  </div>
                  <div className={styles.inputContainer}>
                    <input
                      type={showSignupConfirmPassword ? "text" : "password"}
                      className={styles.inputField}
                      placeholder="Re-enter password"
                      value={signupConfirmPassword}
                      onChange={(e) => setSignupConfirmPassword(e.target.value)}
                      required
                    />
                    <LockIcon className={styles.leadingIcon} />
                    <button
                      type="button"
                      className={styles.trailingIconButton}
                      onClick={() => setShowSignupConfirmPassword(!showSignupConfirmPassword)}
                      aria-label={showSignupConfirmPassword ? "Hide password" : "Show password"}
                    >
                      {showSignupConfirmPassword ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                    </button>
                  </div>
                </div>

                <button type="submit" disabled={isLoading} className={styles.goldSubmitBtn}>
                  <span>{isLoading ? "Creating Account..." : "Complete Registration & Sign In"}</span>
                  <ArrowForwardIcon fontSize="small" />
                </button>
              </form>
            )}

            <div className={styles.authFooter}>
              {authMode === "signin" ? (
                <>
                  <span>Don't have an account yet?</span>
                  <span
                    className={styles.authHighlightLink}
                    style={{ cursor: "pointer" }}
                    onClick={() => handleSwitchMode("signup")}
                  >
                    Sign Up
                  </span>
                </>
              ) : (
                <>
                  <span>Already have an account?</span>
                  <span
                    className={styles.authHighlightLink}
                    style={{ cursor: "pointer" }}
                    onClick={() => handleSwitchMode("signin")}
                  >
                    Sign In
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
