import React from "react";
import { ServiceSubGroup } from "@/data/services";
import styles from "./ServicePricingTable.module.css";

interface ServicePricingTableProps {
  group: ServiceSubGroup;
}

export const ServicePricingTable: React.FC<ServicePricingTableProps> = ({ group }) => {
  return (
    <div className={styles.tableWrapper}>
      {group.groupTitle && (
        <div className={styles.tableHeader}>
          <h3 className={styles.tableGroupTitle}>{group.groupTitle}</h3>
        </div>
      )}

      <table className={styles.table}>
        <tbody>
          {group.items.map((item) => (
            <tr key={item.id} className={styles.tr}>
              <td className={styles.tdService}>
                <div className={styles.serviceName}>
                  <span>{item.name}</span>
                  {item.badge && <span className={styles.serviceBadge}>{item.badge}</span>}
                </div>
                {item.description && <p className={styles.serviceDesc}>{item.description}</p>}
              </td>
              <td className={styles.tdPrice}>{item.priceDisplay}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {group.additionalOptions && (
        <div className={styles.addonsBox}>
          <h4 className={styles.addonsTitle}>{group.additionalOptions.title}</h4>
          <div className={styles.addonsGrid}>
            {group.additionalOptions.items.map((addon, index) => (
              <div key={index} className={styles.addonItem}>
                <span>{addon.label}</span>
                <span className={styles.addonPrice}>{addon.price}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
