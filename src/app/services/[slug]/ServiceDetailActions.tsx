"use client";

import React from "react";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import PhoneIcon from "@mui/icons-material/Phone";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import { PrimaryButton } from "@/components/common/PrimaryButton";
import { trackInteraction } from "@/lib/utils/analytics";
import styles from "./service-details.module.css";

interface ServiceDetailActionsProps {
  whatsappUrl: string;
  phone: string;
  phoneDisplay: string;
  serviceId: string;
  serviceName: string;
}

export const ServiceDetailActions: React.FC<ServiceDetailActionsProps> = ({
  whatsappUrl,
  phone,
  phoneDisplay,
  serviceId,
  serviceName
}) => {
  return (
    <div className={styles.contactActionsGrid}>
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={`${styles.actionButton} ${styles.whatsappButton}`}
        onClick={() =>
          trackInteraction({
            eventType: "whatsapp_click",
            serviceName,
            sourceLocation: "service_detail_page",
            targetUrl: whatsappUrl
          })
        }
      >
        <WhatsAppIcon fontSize="small" />
        <span>WhatsApp Inquiry</span>
      </a>

      <a
        href={`tel:${phone}`}
        className={`${styles.actionButton} ${styles.callButton}`}
        onClick={() =>
          trackInteraction({
            eventType: "call_click",
            serviceName,
            sourceLocation: "service_detail_page",
            targetUrl: `tel:${phone}`
          })
        }
      >
        <PhoneIcon fontSize="small" />
        <span>Call Concierge: {phoneDisplay}</span>
      </a>

      <PrimaryButton
        href={`/booking?serviceId=${serviceId}`}
        variant="gold"
        fullWidth
        onClick={() =>
          trackInteraction({
            eventType: "enquiry_click",
            serviceName,
            sourceLocation: "service_detail_page",
            targetUrl: `/booking?serviceId=${serviceId}`
          })
        }
      >
        <EventAvailableIcon fontSize="small" />
        <span>Enquire Now / Book Slot</span>
      </PrimaryButton>
    </div>
  );
};
