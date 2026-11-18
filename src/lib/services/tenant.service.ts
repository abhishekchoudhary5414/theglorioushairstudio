import { sql } from "@/lib/db/neon";
import { getCurrentUser } from "@/lib/auth/jwt";

export interface TenantContext {
  businessId: string;
  businessName: string;
  role: string;
  userId: string;
}

/**
 * Resolves the authenticated business (tenant) for the current request.
 * If user is authenticated as admin or salon owner, retrieves or auto-provisions
 * the default business for this salon if one doesn't exist yet.
 */
export async function getTenantContext(requestedBusinessId?: string | null): Promise<TenantContext | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  // 1. If explicit businessId is passed, verify user owns or is admin of that business
  if (requestedBusinessId) {
    const businesses = await sql`
      SELECT id, name, owner_id
      FROM businesses
      WHERE id = ${requestedBusinessId}
      LIMIT 1;
    `;
    if (businesses.length > 0) {
      const b = businesses[0];
      if (user.role === "admin" || b.owner_id === user.userId) {
        return {
          businessId: b.id,
          businessName: b.name,
          role: user.role,
          userId: user.userId,
        };
      }
    }
    return null;
  }

  // 2. Look for business owned by this user
  const userBusinesses = await sql`
    SELECT id, name
    FROM businesses
    WHERE owner_id = ${user.userId}
    ORDER BY created_at ASC
    LIMIT 1;
  `;

  if (userBusinesses.length > 0) {
    return {
      businessId: userBusinesses[0].id,
      businessName: userBusinesses[0].name,
      role: user.role,
      userId: user.userId,
    };
  }

  // 3. If admin, check if any business exists or auto-provision default salon business
  if (user.role === "admin") {
    const existing = await sql`
      SELECT id, name
      FROM businesses
      ORDER BY created_at ASC
      LIMIT 1;
    `;
    if (existing.length > 0) {
      return {
        businessId: existing[0].id,
        businessName: existing[0].name,
        role: user.role,
        userId: user.userId,
      };
    }

    // Auto-create initial tenant for this salon
    const created = await sql`
      INSERT INTO businesses (owner_id, name, website_url)
      VALUES (${user.userId}, 'Reflection Salon And Academy', 'https://reflectionsalon.in')
      RETURNING id, name;
    `;

    // Initialize default gallery settings
    if (created.length > 0) {
      await sql`
        INSERT INTO gallery_settings (business_id, hashtag, auto_sync_enabled, auto_publish_enabled)
        VALUES (${created[0].id}, 'reflectionsalon', TRUE, FALSE)
        ON CONFLICT (business_id) DO NOTHING;
      `;
      return {
        businessId: created[0].id,
        businessName: created[0].name,
        role: user.role,
        userId: user.userId,
      };
    }
  }

  return null;
}
