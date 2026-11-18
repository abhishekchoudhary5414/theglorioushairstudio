"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import CardGiftcardIcon from "@mui/icons-material/CardGiftcard";
import CloseIcon from "@mui/icons-material/Close";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import styles from "./WelcomeRewardPopup.module.css";

export const WelcomeRewardPopup: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    // Check if the user is already signed in or has dismissed the popup in this session
    const hasDismissed = sessionStorage.getItem("reward_popup_dismissed");
    if (hasDismissed) return;

    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        // Only show if the user does NOT have an active account/session
        if (!data.authenticated) {
          // Delay display by 2 seconds so the page loads smoothly first
          const timer = setTimeout(() => {
            setIsOpen(true);
          }, 2000);
          return () => clearTimeout(timer);
        }
      })
      .catch(() => {
        // If checking auth fails (guest), still show popup after small delay
        const timer = setTimeout(() => {
          setIsOpen(true);
        }, 2000);
        return () => clearTimeout(timer);
      });
  }, []);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsOpen(false);
      setIsClosing(false);
      sessionStorage.setItem("reward_popup_dismissed", "true");
    }, 300);
  };

  if (!isOpen) return null;

  return (
    <div className={`${styles.overlay} ${isClosing ? styles.fadeOut : styles.fadeIn}`}>
      <div className={`${styles.popupBox} ${isClosing ? styles.scaleDown : styles.scaleUp}`}>
        {/* Close Button */}
        <button
          type="button"
          onClick={handleClose}
          className={styles.closeBtn}
          aria-label="Close promotion popup"
        >
          <CloseIcon fontSize="small" />
        </button>

        {/* Top Gold Ribbon Badge */}
        <div className={styles.giftBadge}>
          <CardGiftcardIcon className={styles.giftIcon} />
          <span className={styles.giftBadgeText}>LIMITED WELCOME PRIVILEGE</span>
        </div>

        {/* Main Title & Offer */}
        <h3 className={styles.title}>
          Register &amp; Claim <span className={styles.goldText}>10 Free Points</span>
        </h3>

        <p className={styles.description}>
          Create your client account at <strong>The Glorious Hair Studio</strong> today and enjoy an instant <strong>10 Points (₹10 Discount)</strong> credited straight to your wallet for your next luxury service or appointment.
        </p>

        {/* Benefits List */}
        <ul className={styles.perksList}>
          <li>
            <CheckCircleIcon fontSize="small" className={styles.checkIcon} />
            <span>Instant 10 points on free OTP registration</span>
          </li>
          <li>
            <CheckCircleIcon fontSize="small" className={styles.checkIcon} />
            <span>Earn 10 extra points on every ₹100 spent</span>
          </li>
          <li>
            <CheckCircleIcon fontSize="small" className={styles.checkIcon} />
            <span>Fast instant booking &amp; official PDF receipt vouchers</span>
          </li>
        </ul>

        {/* Action Button */}
        <div className={styles.actionRow}>
          <Link
            href="/login"
            onClick={handleClose}
            className={styles.claimButton}
          >
            <span>Register &amp; Claim 10 Points</span>
            <ArrowForwardIcon fontSize="small" />
          </Link>
          <button
            type="button"
            onClick={handleClose}
            className={styles.dismissLink}
          >
            Maybe later
          </button>
        </div>
      </div>
    </div>
  );
};
