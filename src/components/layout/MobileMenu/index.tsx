"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import CloseIcon from "@mui/icons-material/Close";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { PrimaryButton } from "@/components/common/PrimaryButton";
import { salonConfig } from "@/config/salon.config";
import styles from "./MobileMenu.module.css";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  navItems: { label: string; href: string }[];
}

export const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen, onClose, navItems }) => {
  return (
    <>
      <div
        className={`${styles.backdrop} ${isOpen ? styles.backdropOpen : ""}`}
        onClick={onClose}
        aria-hidden="true"
      />
      <div className={`${styles.drawer} ${isOpen ? styles.drawerOpen : ""}`}>
        <div className={styles.topBar}>
          <div className={styles.drawerBrand}>
            <div className={styles.drawerLogo}>
              <Image
                src={salonConfig.logo}
                alt={salonConfig.name}
                width={34}
                height={34}
                className={styles.drawerLogoImg}
              />
            </div>
            <span>{salonConfig.name}</span>
          </div>
          <button
            onClick={onClose}
            className={styles.closeButton}
            aria-label="Close Navigation"
          >
            <CloseIcon />
          </button>
        </div>

        <nav className={styles.links}>
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={styles.link}
              onClick={onClose}
            >
              <span>{item.label}</span>
              <ChevronRightIcon fontSize="small" style={{ color: "var(--color-secondary)" }} />
            </Link>
          ))}
        </nav>

        <div className={styles.footer}>
          <PrimaryButton href="/booking" variant="gold" fullWidth onClick={onClose}>
            Book Appointment
          </PrimaryButton>
          <div className={styles.contactInfo}>
            <p>Concierge: {salonConfig.contact.phoneDisplay}</p>
            <p>{salonConfig.address.city}, India</p>
          </div>
        </div>
      </div>
    </>
  );
};

