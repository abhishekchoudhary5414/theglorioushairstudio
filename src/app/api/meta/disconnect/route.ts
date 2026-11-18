import { NextResponse } from "next/server";
import { sql } from "@/lib/db/neon";
import { getTenantContext } from "@/lib/services/tenant.service";

/**
 * POST /api/meta/disconnect
 * Disconnects the business's Instagram connection and revokes stored tokens.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const requestedBusinessId = body.businessId;

    const tenant = await getTenantContext(requestedBusinessId);
    if (!tenant) {
      return NextResponse.json(
        { success: false, message: "Unauthorized." },
        { status: 401 }
      );
    }

    const businessId = tenant.businessId;

    // Disconnect and wipe access token
    await sql`
      UPDATE instagram_connections
      SET
        connection_status = 'disconnected',
        encrypted_access_token = '',
        error_message = 'Disconnected by user',
        updated_at = NOW()
      WHERE business_id = ${businessId};
    `;

    return NextResponse.json({
      success: true,
      message: "Instagram account disconnected successfully.",
    });
  } catch (err: unknown) {
    console.error("[Meta Disconnect] Error:", err);
    return NextResponse.json(
      { success: false, message: (err as Error).message || "Internal server error" },
      { status: 500 }
    );
  }
}
