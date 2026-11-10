"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import PersonIcon from "@mui/icons-material/Person";
import LockIcon from "@mui/icons-material/Lock";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { salonConfig } from "@/config/salon.config";
import styles from "./AdminLogin.module.css";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Invalid credentials.");
      }

      // Redirect to /dashboard upon successful admin authentication
      window.location.href = "/dashboard";
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Authentication failed.";
      setErrorMsg(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginAura} />
      <div className={styles.loginCard}>
        <div className={styles.brandBadge}>
          <div className={styles.logoWrapper}>
            <Image
              src="/images/logo.png"
              alt={salonConfig.name}
              width={68}
              height={68}
              className={styles.logoImg}
              priority
            />
          </div>
          <h1 className={styles.portalTitle}>Atelier Management</h1>
          <p className={styles.portalSubtitle}>Admin Portal &amp; Control Center</p>
        </div>

        {errorMsg && <div className={styles.errorBanner}>{errorMsg}</div>}

        <form onSubmit={handleLogin} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="admin-username" className={styles.label}>
              Username or Email
            </label>
            <div className={styles.inputWrapper}>
              <PersonIcon className={styles.inputIcon} />
              <input
                id="admin-username"
                type="text"
                required
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                className={styles.input}
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="admin-password" className={styles.label}>
              Master Password
            </label>
            <div className={styles.inputWrapper}>
              <LockIcon className={styles.inputIcon} />
              <input
                id="admin-password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={styles.input}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={styles.submitBtn}
          >
            <span>{loading ? "Authenticating..." : "Sign In to Dashboard"}</span>
            <ArrowForwardIcon fontSize="small" />
          </button>
        </form>

        <p className={styles.helperText}>
          Protected Atelier System. Default login credentials stored securely in Neon PostgreSQL.
        </p>

        <Link href="/" className={styles.backHomeLink}>
          ← Return to Salon Website
        </Link>
      </div>
    </div>
  );
}
