"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import PersonIcon from "@mui/icons-material/Person";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import LoyaltyIcon from "@mui/icons-material/Loyalty";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import HowToRegIcon from "@mui/icons-material/HowToReg";
import styles from "./FixedBottomAuthBar.module.css";

export const FixedBottomAuthBar: React.FC = () => {
  const pathname = usePathname();
  const [userSession, setUserSession] = useState<{ name: string; role: string; points?: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated && data.user) {
          setUserSession({
            name: data.user.name,
            role: data.user.role,
            points: data.loyalty?.currentPoints ?? 0,
          });
        } else {
          setUserSession(null);
        }
      })
      .catch(() => {
        setUserSession(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [pathname]);

  // Don't show inside admin control panel or dedicated login/register pages
  if (pathname.startsWith("/admin") || pathname.startsWith("/login") || pathname.startsWith("/register") || pathname.startsWith("/forgot-password")) {
    return null;
  }

  return (
    <aside className={styles.bottomBarContainer} aria-label="Customer Account Quick Access">
      <div className={styles.innerBar}>
        {userSession ? (
          /* User is Signed In: Show Profile Initial, View Points (links to loyalty tab/dashboard), and Book Slot */
          <div className={styles.signedInView}>
            <div className={styles.userLeft}>
              <Link href="/dashboard" className={styles.profileAvatarLink} title="Account Profile">
                <span className={styles.userAvatar}>
                  {userSession.name?.trim() ? userSession.name.trim().charAt(0).toUpperCase() : "U"}
                </span>
              </Link>
              <Link href="/dashboard?tab=loyalty" className={styles.pointsBadge} title="View Loyalty Points">
                <LoyaltyIcon fontSize="small" />
                <span className={styles.pointsCount}>{userSession.points ?? 0} Pts</span>
              </Link>
            </div>

            <div className={styles.actionButtons}>
              <Link href="/dashboard" className={styles.dashboardBtn}>
                <PersonIcon fontSize="small" />
                <span>Dashboard</span>
              </Link>
              <Link href="/booking" className={styles.bookSlotBtn}>
                <CalendarMonthIcon fontSize="small" />
                <span>Book Slot</span>
              </Link>
            </div>
          </div>
        ) : (
          /* User is NOT Signed In: Show Fixed Sign In / Sign Up Bar */
          <div className={styles.guestView}>
            <div className={styles.guestNotice}>
              <span className={styles.giftBadge}>🎁 10 FREE POINTS</span>
              <span className={styles.guestText}>Join client privileges &amp; claim your welcome reward</span>
            </div>

            <div className={styles.guestActions}>
              <Link href="/login" className={styles.signInBtn}>
                <LockOpenIcon fontSize="small" />
                <span>Sign In</span>
              </Link>
              <Link href="/login" className={styles.signUpBtn}>
                <HowToRegIcon fontSize="small" />
                <span>Sign Up (Get 10 Pts)</span>
              </Link>
              <Link href="/booking" className={styles.bookSlotBtn}>
                <CalendarMonthIcon fontSize="small" />
                <span>Book Appointment</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
