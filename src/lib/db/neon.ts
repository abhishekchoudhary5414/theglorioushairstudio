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
      mobile_number VARCHAR(20),
      password_hash VARCHAR(255) NOT NULL,
      role VARCHAR(50) DEFAULT 'customer',
      profile_image TEXT,
      email_verified BOOLEAN DEFAULT FALSE,
      mobile_verified BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;
  await client`CREATE INDEX IF NOT EXISTS idx_users_mobile ON users(mobile_number);`;

  // 1b. Customer Auth Accounts (Google OAuth, etc.)
  await client`
    CREATE TABLE IF NOT EXISTS customer_auth_accounts (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      customer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      provider VARCHAR(50) NOT NULL,
      provider_account_id VARCHAR(255) NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT uq_provider_account UNIQUE(provider, provider_account_id)
    );
  `;
  await client`CREATE INDEX IF NOT EXISTS idx_auth_accounts_customer ON customer_auth_accounts(customer_id);`;

  // 1c. OTP Verifications
  await client`
    CREATE TABLE IF NOT EXISTS otp_verifications (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      mobile_number VARCHAR(20),
      email VARCHAR(255),
      otp_hash VARCHAR(255) NOT NULL,
      purpose VARCHAR(50) NOT NULL,
      expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
      attempts INTEGER DEFAULT 0,
      verified_at TIMESTAMP WITH TIME ZONE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;
  await client`CREATE INDEX IF NOT EXISTS idx_otp_target ON otp_verifications(mobile_number, email, purpose);`;

  // 2. Bookings Table (Appointment Reservations)
  await client`
    CREATE TABLE IF NOT EXISTS bookings (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      booking_reference VARCHAR(50) UNIQUE NOT NULL,
      customer_id UUID REFERENCES users(id) ON DELETE SET NULL,
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
      total_amount NUMERIC(10, 2) DEFAULT 0,
      points_redeemed INTEGER DEFAULT 0,
      discount_amount NUMERIC(10, 2) DEFAULT 0,
      payable_amount NUMERIC(10, 2) DEFAULT 0,
      payment_status VARCHAR(50) DEFAULT 'unpaid',
      status VARCHAR(50) DEFAULT 'confirmed',
      special_instructions TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;
  await client`CREATE INDEX IF NOT EXISTS idx_bookings_customer ON bookings(customer_id);`;

  // 2b. Payments Table
  await client`
    CREATE TABLE IF NOT EXISTS payments (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      customer_id UUID REFERENCES users(id) ON DELETE SET NULL,
      booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
      razorpay_order_id VARCHAR(100) UNIQUE NOT NULL,
      razorpay_payment_id VARCHAR(100) UNIQUE,
      amount NUMERIC(10, 2) NOT NULL,
      currency VARCHAR(10) DEFAULT 'INR',
      payment_status VARCHAR(50) DEFAULT 'created',
      signature_verified BOOLEAN DEFAULT FALSE,
      payment_method VARCHAR(50),
      raw_response JSONB,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;
  await client`CREATE INDEX IF NOT EXISTS idx_payments_booking ON payments(booking_id);`;
  await client`CREATE INDEX IF NOT EXISTS idx_payments_customer ON payments(customer_id);`;
  await client`CREATE INDEX IF NOT EXISTS idx_payments_order ON payments(razorpay_order_id);`;

  // 2c. Loyalty Settings Table
  await client`
    CREATE TABLE IF NOT EXISTS loyalty_settings (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      is_enabled BOOLEAN DEFAULT TRUE,
      spending_amount NUMERIC(10, 2) DEFAULT 100.00,
      points_per_unit INTEGER DEFAULT 10,
      point_value NUMERIC(10, 2) DEFAULT 1.00,
      minimum_redemption INTEGER DEFAULT 50,
      maximum_redemption_percentage NUMERIC(5, 2) DEFAULT 30.00,
      expiration_days INTEGER DEFAULT 90,
      allow_partial_redemption BOOLEAN DEFAULT TRUE,
      excluded_services JSONB DEFAULT '[]'::jsonb,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;

  // 2d. Loyalty Transactions Table
  await client`
    CREATE TABLE IF NOT EXISTS loyalty_transactions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      customer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
      payment_id UUID REFERENCES payments(id) ON DELETE SET NULL,
      transaction_type VARCHAR(50) NOT NULL,
      points INTEGER NOT NULL,
      description TEXT,
      expires_at TIMESTAMP WITH TIME ZONE,
      status VARCHAR(50) DEFAULT 'active',
      admin_id UUID REFERENCES users(id) ON DELETE SET NULL,
      metadata JSONB,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;
  await client`CREATE INDEX IF NOT EXISTS idx_loyalty_tx_customer ON loyalty_transactions(customer_id, created_at DESC);`;

  // 2e. Loyalty Point Lots Table (FIFO lots)
  await client`
    CREATE TABLE IF NOT EXISTS loyalty_point_lots (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      customer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      source_transaction_id UUID NOT NULL REFERENCES loyalty_transactions(id) ON DELETE CASCADE,
      original_points INTEGER NOT NULL,
      remaining_points INTEGER NOT NULL,
      expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;
  await client`CREATE INDEX IF NOT EXISTS idx_point_lots_fifo ON loyalty_point_lots(customer_id, expires_at ASC);`;

  // 2f. Loyalty Redemptions Table
  await client`
    CREATE TABLE IF NOT EXISTS loyalty_redemptions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      customer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
      points_redeemed INTEGER NOT NULL,
      discount_amount NUMERIC(10, 2) NOT NULL,
      status VARCHAR(50) DEFAULT 'reserved',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;
  await client`CREATE INDEX IF NOT EXISTS idx_redemptions_customer ON loyalty_redemptions(customer_id);`;

  // 2g. Loyalty Redemption Allocations Table
  await client`
    CREATE TABLE IF NOT EXISTS loyalty_redemption_allocations (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      redemption_id UUID NOT NULL REFERENCES loyalty_redemptions(id) ON DELETE CASCADE,
      point_lot_id UUID NOT NULL REFERENCES loyalty_point_lots(id) ON DELETE CASCADE,
      points_consumed INTEGER NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;
  await client`CREATE INDEX IF NOT EXISTS idx_allocations_redemption ON loyalty_redemption_allocations(redemption_id);`;

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

  // ==========================================================
  // DITVI GALLERY: Multi-tenant Instagram Hashtag Integration
  // ==========================================================

  // 5a. Businesses Table (Tenants)
  await client`
    CREATE TABLE IF NOT EXISTS businesses (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      owner_id UUID REFERENCES users(id) ON DELETE SET NULL,
      name VARCHAR(255) NOT NULL,
      website_url VARCHAR(500),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;
  await client`CREATE INDEX IF NOT EXISTS idx_businesses_owner ON businesses(owner_id);`;

  // 5b. Instagram Connections Table
  await client`
    CREATE TABLE IF NOT EXISTS instagram_connections (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
      instagram_user_id VARCHAR(100) NOT NULL,
      instagram_username VARCHAR(100),
      facebook_page_id VARCHAR(100),
      facebook_page_name VARCHAR(255),
      profile_picture_url TEXT,
      encrypted_access_token TEXT NOT NULL,
      token_expires_at TIMESTAMP WITH TIME ZONE,
      token_type VARCHAR(50) DEFAULT 'long_lived',
      connection_status VARCHAR(50) DEFAULT 'connected',
      error_message TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT uq_business_ig_conn UNIQUE(business_id)
    );
  `;
  await client`CREATE INDEX IF NOT EXISTS idx_ig_conn_business ON instagram_connections(business_id);`;
  await client`CREATE INDEX IF NOT EXISTS idx_ig_conn_ig_user ON instagram_connections(instagram_user_id);`;

  // 5c. Gallery Settings Table
  await client`
    CREATE TABLE IF NOT EXISTS gallery_settings (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
      hashtag VARCHAR(100),
      hashtag_id VARCHAR(100),
      auto_sync_enabled BOOLEAN DEFAULT TRUE,
      auto_publish_enabled BOOLEAN DEFAULT FALSE,
      sync_interval_minutes INTEGER DEFAULT 60,
      last_synced_at TIMESTAMP WITH TIME ZONE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT uq_business_gallery_settings UNIQUE(business_id)
    );
  `;
  await client`CREATE INDEX IF NOT EXISTS idx_gallery_settings_business ON gallery_settings(business_id);`;
  await client`CREATE INDEX IF NOT EXISTS idx_gallery_settings_hashtag ON gallery_settings(hashtag);`;

  // 5d. Instagram Posts Table
  await client`
    CREATE TABLE IF NOT EXISTS instagram_posts (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
      instagram_media_id VARCHAR(100) NOT NULL,
      media_type VARCHAR(50) NOT NULL,
      media_url TEXT,
      thumbnail_url TEXT,
      caption TEXT,
      permalink VARCHAR(500) NOT NULL,
      username VARCHAR(100),
      published_at TIMESTAMP WITH TIME ZONE,
      moderation_status VARCHAR(50) DEFAULT 'PENDING',
      is_featured BOOLEAN DEFAULT FALSE,
      like_count INTEGER DEFAULT 0,
      comments_count INTEGER DEFAULT 0,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT uq_business_post UNIQUE(business_id, instagram_media_id)
    );
  `;
  await client`CREATE INDEX IF NOT EXISTS idx_ig_posts_business_status ON instagram_posts(business_id, moderation_status);`;
  await client`CREATE INDEX IF NOT EXISTS idx_ig_posts_published ON instagram_posts(business_id, published_at DESC);`;
  await client`CREATE INDEX IF NOT EXISTS idx_ig_posts_featured ON instagram_posts(business_id, is_featured);`;

  // 5e. Synchronization Logs Table
  await client`
    CREATE TABLE IF NOT EXISTS sync_logs (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
      status VARCHAR(50) NOT NULL,
      posts_discovered INTEGER DEFAULT 0,
      posts_saved INTEGER DEFAULT 0,
      error_message TEXT,
      started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      completed_at TIMESTAMP WITH TIME ZONE
    );
  `;
  await client`CREATE INDEX IF NOT EXISTS idx_sync_logs_business ON sync_logs(business_id, started_at DESC);`;
}
