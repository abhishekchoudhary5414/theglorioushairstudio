"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import InstagramIcon from "@mui/icons-material/Instagram";
import FacebookIcon from "@mui/icons-material/Facebook";
import YouTubeIcon from "@mui/icons-material/YouTube";
import PinterestIcon from "@mui/icons-material/Pinterest";
import { salonConfig } from "@/config/salon.config";
import styles from "./Footer.module.css";

export const Footer: React.FC = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.grid}>
          {/* Brand Info */}
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
              <a
                href={salonConfig.socials.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialIcon}
                aria-label="Instagram"
              >
                <InstagramIcon fontSize="small" />
              </a>
              <a
                href={salonConfig.socials.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialIcon}
                aria-label="Facebook"
              >
                <FacebookIcon fontSize="small" />
              </a>
              {salonConfig.socials.youtube && (
                <a
                  href={salonConfig.socials.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.socialIcon}
                  aria-label="YouTube"
                >
                  <YouTubeIcon fontSize="small" />
                </a>
              )}
              {salonConfig.socials.pinterest && (
                <a
                  href={salonConfig.socials.pinterest}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.socialIcon}
                  aria-label="Pinterest"
                >
                  <PinterestIcon fontSize="small" />
                </a>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className={styles.columnTitle}>Navigation</h4>
            <ul className={styles.linkList}>
              <li><Link href="/about">About Our Atelier</Link></li>
              <li><Link href="/services">Haute Services Menu</Link></li>
              <li><Link href="/experts">Master Artisans</Link></li>
              <li><Link href="/bridal">Bridal Sanctuary</Link></li>
              <li><Link href="/gallery">Transformation Gallery</Link></li>
              <li><Link href="/offers">Privilege Offers</Link></li>
              <li><Link href="/contact">Concierge & Locations</Link></li>
              <li><Link href="/booking">Book Online</Link></li>
            </ul>
          </div>

          {/* Services Menu */}
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

          {/* Atelier Hours */}
          <div>
            <h4 className={styles.columnTitle}>Atelier Hours</h4>
            <div className={styles.hoursBlock}>
              {salonConfig.hours.map((h, i) => (
                <div key={i} className={styles.hourRow}>
                  <span className={styles.hourDays}>{h.days}</span>
                  <span className={styles.hourTime}>{h.time}</span>
                  {h.note && <span className={styles.hourNote}>{h.note}</span>}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.bottomBar}>
          <div>
            © 2026 {salonConfig.name}. All Rights Reserved. Luxury Indian Beauty Brand.
          </div>
          <div className={styles.legalLinks}>
            <Link href="/about">Safety Protocols</Link>
            <Link href="/contact">Client Charter</Link>
            <Link href="/privacy-policy">Privacy Policy</Link>
            <Link href="/terms">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
