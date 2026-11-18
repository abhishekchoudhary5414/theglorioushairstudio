"use client";

import React, { useState } from "react";
import Link from "next/link";
import PhoneIcon from "@mui/icons-material/Phone";
import LockIcon from "@mui/icons-material/Lock";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import SpaIcon from "@mui/icons-material/Spa";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import styles from "@/app/login/Auth.module.css";

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<1 | 2>(1);
  const [identifier, setIdentifier] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleSendResetOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier) {
      setErrorMsg("Please enter your mobile number or email.");
      return;
    }
    setErrorMsg("");
    setIsLoading(true);

    const isNum = /^\d+$/.test(identifier.replace(/\D/g, ""));
    const payload = isNum
      ? { mobile: identifier.replace(/\D/g, "").slice(-10), purpose: "reset_password" }
      : { email: identifier.trim(), purpose: "reset_password" };

    try {
      const res = await fetch("/api/auth/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg("Reset code sent! Please enter the code and your new password.");
        setStep(2);
      } else {
        setErrorMsg(data.message || "Failed to send reset code.");
      }
    } catch {
      setErrorMsg("Unable to send reset code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }
    if (newPassword.length < 6) {
      setErrorMsg("Password must be at least 6 characters long.");
      return;
    }
    setErrorMsg("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier,
          otp,
          newPassword,
        }),
      });
      const data = await res.json();

      if (data.success) {
        setSuccessMsg("Password reset successfully! Redirecting to login...");
        setTimeout(() => {
          window.location.href = "/login";
        }, 1200);
      } else {
        setErrorMsg(data.message || "Password reset failed.");
      }
    } catch {
      setErrorMsg("An error occurred during password reset.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Header />
      <div className={styles.authContainer}>
        <div className={styles.authCard}>
          <div className={styles.goldBar} />
          <div className={styles.cardHeader}>
            <div className={styles.brandLogo}>
              <SpaIcon fontSize="medium" />
            </div>
            <h1 className={styles.title}>Reset Password</h1>
            <p className={styles.subtitle}>
              {step === 1
                ? "Enter your mobile or email to receive a verification OTP"
                : "Enter received code and set a new password"}
            </p>
          </div>

          <div className={styles.cardBody}>
            {errorMsg && (
              <div className={styles.errorBanner}>
                <ErrorIcon fontSize="small" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className={styles.successBanner}>
                <CheckCircleIcon fontSize="small" />
                <span>{successMsg}</span>
              </div>
            )}

            {step === 1 ? (
              <form onSubmit={handleSendResetOtp}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Mobile Number or Email</label>
                  <div className={styles.inputWrapper}>
                    <PhoneIcon className={styles.inputIcon} />
                    <input
                      type="text"
                      className={styles.textInput}
                      placeholder="e.g. 9876543210 or your@email.com"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <button type="submit" disabled={isLoading} className={styles.submitBtn}>
                  <span>{isLoading ? "Sending Code..." : "Send Reset OTP"}</span>
                  <ArrowForwardIcon fontSize="small" />
                </button>
              </form>
            ) : (
              <form onSubmit={handleResetPassword}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>6-Digit Reset Code *</label>
                  <div className={styles.inputWrapper}>
                    <LockIcon className={styles.inputIcon} />
                    <input
                      type="text"
                      maxLength={6}
                      className={styles.textInput}
                      placeholder="123456"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>New Password *</label>
                  <div className={styles.inputWrapper}>
                    <LockIcon className={styles.inputIcon} />
                    <input
                      type="password"
                      className={styles.textInput}
                      placeholder="At least 6 characters"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Confirm New Password *</label>
                  <div className={styles.inputWrapper}>
                    <LockIcon className={styles.inputIcon} />
                    <input
                      type="password"
                      className={styles.textInput}
                      placeholder="Re-enter new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <button type="submit" disabled={isLoading} className={styles.submitBtn}>
                  <span>{isLoading ? "Resetting..." : "Save New Password"}</span>
                  <ArrowForwardIcon fontSize="small" />
                </button>
              </form>
            )}

            <div className={styles.footerLinks}>
              Remembered your password?{" "}
              <Link href="/login" className={styles.linkAccent}>
                Back to Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
