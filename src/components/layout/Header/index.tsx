"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import MenuIcon from "@mui/icons-material/Menu";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { PrimaryButton } from "@/components/common/PrimaryButton";
import { MobileMenu } from "@/components/layout/MobileMenu";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { salonConfig } from "@/config/salon.config";
import { SALON_SERVICES_CATEGORIES } from "@/data/services";
import styles from "./Header.module.css";

const SERVICE_MENU_ITEMS = [
  { label: "All Services", href: "/services" },
  ...SALON_SERVICES_CATEGORIES.map((category) => ({
    label: category.title,
    href: `/services/${category.slug}`,
  })),
];

const NAV_ITEMS = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Services", href: "/services", children: SERVICE_MENU_ITEMS },
  { label: "Experts", href: "/experts" },
  { label: "Gallery", href: "/gallery" },
  { label: "Bridal", href: "/bridal" },
  { label: "Offers", href: "/offers" },
  { label: "Contact", href: "/contact" },
];

export const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [servicesMenuOpen, setServicesMenuOpen] = useState(false);
  const [pathname, setPathname] = useState("/");
  const servicesMenuRef = useRef<HTMLDivElement | null>(null);
  const activeServiceCategory = pathname.startsWith("/services/") ? pathname.replace("/services/", "") : null;

  useEffect(() => {
    const syncPathname = () => {
      setPathname(window.location.pathname || "/");
    };

    syncPathname();

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };

    const handleLocationChange = () => {
      syncPathname();
    };

    const originalPushState = window.history.pushState;
    const originalReplaceState = window.history.replaceState;

    window.history.pushState = function patchedPushState(...args) {
      const result = originalPushState.apply(this, args);
      handleLocationChange();
      return result;
    };

    window.history.replaceState = function patchedReplaceState(...args) {
      const result = originalReplaceState.apply(this, args);
      handleLocationChange();
      return result;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("popstate", handleLocationChange);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("popstate", handleLocationChange);
      window.history.pushState = originalPushState;
      window.history.replaceState = originalReplaceState;
    };
  }, []);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (!servicesMenuRef.current) return;

      if (!servicesMenuRef.current.contains(event.target as Node)) {
        setServicesMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
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
                if (item.children) {
                  const isActive =
                    pathname === item.href ||
                    pathname.startsWith("/services/") ||
                    item.children.some((child) => pathname === child.href);

                  return (
                    <div
                      key={item.href}
                      ref={servicesMenuRef}
                      className={styles.servicesMenuWrapper}
                      onMouseEnter={() => setServicesMenuOpen(true)}
                      onMouseLeave={() => setServicesMenuOpen(false)}
                    >
                      <button
                        type="button"
                        className={`${styles.navButton} ${isActive ? styles.navLinkActive : ""}`}
                        onClick={() => setServicesMenuOpen((open) => !open)}
                        aria-expanded={servicesMenuOpen}
                        aria-haspopup="menu"
                      >
                        <span>{item.label}</span>
                        <KeyboardArrowDownIcon
                          fontSize="small"
                          className={`${styles.chevronIcon} ${servicesMenuOpen ? styles.chevronIconOpen : ""}`}
                        />
                      </button>

                      <div
                        className={`${styles.servicesDropdown} ${servicesMenuOpen ? styles.servicesDropdownOpen : ""}`}
                        role="menu"
                      >
                        {item.children.map((child) => {
                          const isChildActive =
                            pathname === child.href ||
                            (child.href === "/services" && pathname === "/services") ||
                            (activeServiceCategory && child.href === `/services/${activeServiceCategory}`);

                          return (
                            <Link
                              key={child.href}
                              href={child.href}
                              className={`${styles.servicesDropdownLink} ${isChildActive ? styles.servicesDropdownLinkActive : ""}`}
                              onClick={() => setServicesMenuOpen(false)}
                              role="menuitem"
                            >
                              {child.label}
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  );
                }

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
