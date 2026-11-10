"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import InstagramIcon from "@mui/icons-material/Instagram";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import { salonConfig } from "@/config/salon.config";
import styles from "./Footer.module.css";

export const Footer: React.FC = () => {
  const socialLinks = [
    {
      href: salonConfig.socials.instagram,
      label: "Instagram",
      icon: <InstagramIcon fontSize="small" />,
    },
    {
      href: `https://wa.me/${salonConfig.contact.whatsapp.replace(/\D/g, "")}`,
      label: "WhatsApp",
      icon: <WhatsAppIcon fontSize="small" />,
    },
  ].filter((link) => Boolean(link.href));

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.grid}>
          <div className={styles.brandCol}>
            <div className={styles.brandHeader}>
              <div className={styles.footerLogoWrapper}>
                <Image
                  src={salonConfig.logo}
                  alt={salonConfig.name}
                  width={50}
                  height={50}
                  className={styles.footerLogoImg}
                />
              </div>
              <span className={styles.brandTitle}>{salonConfig.name}</span>
            </div>
            <span className={styles.brandTagline}>{salonConfig.tagline}</span>
            <p className={styles.brandDesc}>{salonConfig.description}</p>
            <div className={styles.socialRow}>
              {socialLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.socialIcon}
                  aria-label={link.label}
                >
                  {link.icon}
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className={styles.columnTitle}>Navigation</h4>
            <ul className={styles.linkList}>
              <li><Link href="/about">About Our Atelier</Link></li>
              <li><Link href="/services">Haute Services Menu</Link></li>
              <li><Link href="/experts">Master Artisans</Link></li>
              <li><Link href="/bridal">Bridal Sanctuary</Link></li>
              <li><Link href="/gallery">Transformation Gallery</Link></li>
              <li><Link href="/offers">Privilege Offers</Link></li>
              <li><Link href="/contact">Concierge &amp; Locations</Link></li>
              <li><Link href="/booking">Book Online</Link></li>
            </ul>
          </div>

          <div>
            <h4 className={styles.columnTitle}>Signature Rituals</h4>
            <ul className={styles.linkList}>
              <li><Link href="/services/hair-treatments">Professional Hair Treatments</Link></li>
              <li><Link href="/services/hair-colour">Hair Colour Services</Link></li>
              <li><Link href="/services/hair-spa">Hair Spa Rituals</Link></li>
              <li><Link href="/services/facial-cleanup">Facial &amp; Cleanup Care</Link></li>
              <li><Link href="/services/makeup-hair-styling">Makeup &amp; Hair Styling</Link></li>
              <li><Link href="/services/academic-courses">Academy Courses</Link></li>
            </ul>
          </div>
        </div>

        <div className={styles.bottomBar}>
          <div>
            © 2026 {salonConfig.name}. All Rights Reserved.
          </div>
          <div className={styles.legalLinks}>
            <Link href="/privacy-policy">Privacy Policy</Link>
            <Link href="/terms">Terms of Service</Link>
            <Link href="/admin/login">Admin</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
