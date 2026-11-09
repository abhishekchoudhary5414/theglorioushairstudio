import React from "react";
import Link from "next/link";
import styles from "./PrimaryButton.module.css";

interface PrimaryButtonProps {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  variant?: "primary" | "gold";
  fullWidth?: boolean;
  type?: "button" | "submit" | "reset";
  className?: string;
  disabled?: boolean;
}

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  children,
  href,
  onClick,
  variant = "primary",
  fullWidth = false,
  type = "button",
  className = "",
  disabled = false,
}) => {
  const combinedClass = `${styles.button} ${variant === "gold" ? styles.goldVariant : ""} ${fullWidth ? styles.fullWidth : ""} ${className}`;

  if (href) {
    return (
      <Link href={href} className={combinedClass}>
        {children}
      </Link>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      className={combinedClass}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

