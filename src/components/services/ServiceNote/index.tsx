import React from "react";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import styles from "./ServiceNote.module.css";

interface ServiceNoteProps {
  title?: string;
  note: string;
}

export const ServiceNote: React.FC<ServiceNoteProps> = ({
  title = "Important Information",
  note,
}) => {
  return (
    <div className={styles.noteWrapper}>
      <div className={styles.iconWrapper}>
        <InfoOutlinedIcon fontSize="small" />
      </div>
      <div className={styles.content}>
        <span className={styles.noteTitle}>{title}</span>
        <p className={styles.noteText}>{note}</p>
      </div>
    </div>
  );
};
