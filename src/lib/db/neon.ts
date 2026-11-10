import { neon } from "@neondatabase/serverless";

export async function getDbClient() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL environment variable is missing.");
  }
  return neon(connectionString);
}

// Global safe SQL query runner for server-side endpoints
export const sql = (strings: TemplateStringsArray, ...values: unknown[]) => {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.warn("Neon DATABASE_URL is not set.");
    return Promise.resolve([]);
  }
  const client = neon(connectionString);
  return client(strings, ...values);
};

export async function initDbSchema() {
  if (!process.env.DATABASE_URL) {
    console.warn("Skipping Neon schema init: DATABASE_URL not set.");
    return;
  }

  const client = neon(process.env.DATABASE_URL);

  // 1. Users Table (Authentication & Customer profiles)
  await client`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      username VARCHAR(100) UNIQUE,
      phone VARCHAR(20),
      password_hash VARCHAR(255) NOT NULL,
      role VARCHAR(50) DEFAULT 'customer',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;

  // 2. Bookings Table (Appointment Reservations)
  await client`
    CREATE TABLE IF NOT EXISTS bookings (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      booking_reference VARCHAR(50) UNIQUE NOT NULL,
      service_id VARCHAR(100) NOT NULL,
      service_name VARCHAR(255) NOT NULL,
      stylist_id VARCHAR(100),
      stylist_name VARCHAR(255),
      branch_id VARCHAR(100) NOT NULL,
      branch_name VARCHAR(255) NOT NULL,
      appointment_date DATE NOT NULL,
      time_slot VARCHAR(50) NOT NULL,
      customer_name VARCHAR(255) NOT NULL,
      customer_phone VARCHAR(20) NOT NULL,
      customer_email VARCHAR(255),
      price_inr NUMERIC(10, 2),
      status VARCHAR(50) DEFAULT 'confirmed',
      special_instructions TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;

  // 3. Contact Inquiries Table (General contact form submissions)
  await client`
    CREATE TABLE IF NOT EXISTS contact_inquiries (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(255) NOT NULL,
      phone VARCHAR(20) NOT NULL,
      email VARCHAR(255),
      service_interest VARCHAR(100),
      message TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;

  // 4. Interaction Events Table (Tracking Call clicks, WhatsApp clicks, button clicks)
  await client`
    CREATE TABLE IF NOT EXISTS interaction_events (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      event_type VARCHAR(50) NOT NULL,
      service_name VARCHAR(255),
      source_location VARCHAR(100),
      target_url TEXT,
      page_path VARCHAR(255),
      device_type VARCHAR(50),
      ip_address VARCHAR(100),
      user_agent TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;

  // Indexes for high performance queries
  await client`CREATE INDEX IF NOT EXISTS idx_events_type ON interaction_events(event_type);`;
  await client`CREATE INDEX IF NOT EXISTS idx_events_created ON interaction_events(created_at DESC);`;
  await client`CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(appointment_date);`;
}
