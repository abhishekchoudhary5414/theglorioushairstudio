"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import MenuIcon from "@mui/icons-material/Menu";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import { PrimaryButton } from "@/components/common/PrimaryButton";
import { MobileMenu } from "@/components/layout/MobileMenu";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { salonConfig } from "@/config/salon.config";
import styles from "./Header.module.css";

const NAV_ITEMS = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Services", href: "/services" },
  { label: "Experts", href: "/experts" },
  { label: "Gallery", href: "/gallery" },
  { label: "Bridal", href: "/bridal" },
  { label: "Offers", href: "/offers" },
  { label: "Contact", href: "/contact" },
];

export const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <div className={styles.headerWrapper}>
        <AnnouncementBar />
        <header className={`${styles.header} ${isScrolled ? styles.scrolled : ""}`}>
          <div className={styles.container}>
            <Link href="/" className={styles.brand}>
              <div className={styles.logoImageWrapper}>
                <Image
                  src={salonConfig.logo}
                  alt={salonConfig.name}
                  width={44}
                  height={44}
                  priority
                  className={styles.logoImg}
                />
              </div>
              <div className={styles.brandText}>
                <span className={styles.logoText}>{salonConfig.name}</span>
                <span className={styles.tagline}>Unisex Salon &amp; Bridal Studio</span>
              </div>
            </Link>

            <nav className={styles.nav}>
              {NAV_ITEMS.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`${styles.navLink} ${isActive ? styles.navLinkActive : ""}`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className={styles.actions}>
              <div className={styles.desktopAppointmentBtn}>
                <PrimaryButton href="/booking" variant="gold">
                  <CalendarMonthIcon fontSize="small" />
                  <span>Book Appointment</span>
                </PrimaryButton>
              </div>

              <button
                className={styles.mobileToggle}
                onClick={() => setMobileMenuOpen(true)}
                aria-label="Open Navigation Menu"
              >
                <MenuIcon fontSize="large" />
              </button>
            </div>
          </div>
        </header>
      </div>

      <MobileMenu
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        navItems={NAV_ITEMS}
      />
    </>
  );
};
