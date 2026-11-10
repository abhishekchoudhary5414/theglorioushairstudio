import React from "react";
import Link from "next/link";
import styles from "./SecondaryButton.module.css";

interface SecondaryButtonProps {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  inverse?: boolean;
  fullWidth?: boolean;
  type?: "button" | "submit" | "reset";
  className?: string;
  disabled?: boolean;
  target?: string;
  rel?: string;
}

export const SecondaryButton: React.FC<SecondaryButtonProps> = ({
  children,
  href,
  onClick,
  inverse = false,
  fullWidth = false,
  type = "button",
  className = "",
  disabled = false,
  target,
  rel,
}) => {
  const combinedClass = `${styles.button} ${inverse ? styles.inverse : ""} ${fullWidth ? styles.fullWidth : ""} ${className}`;

  if (href) {
    return (
      <Link href={href} className={combinedClass} target={target} rel={rel}>
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

