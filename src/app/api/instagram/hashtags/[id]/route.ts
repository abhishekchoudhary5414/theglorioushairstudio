import { NextResponse } from "next/server";
import { sql } from "@/lib/db/neon";
import { getTenantContext } from "@/lib/services/tenant.service";

/**
 * DELETE /api/instagram/hashtags/[id]
 * Deletes or toggles a hashtag for the business
 */
export async function DELETE(
  req: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const hashtagId = params.id;

    const tenant = await getTenantContext();
    if (!tenant) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const deleted = await sql`
      DELETE FROM instagram_hashtags
      WHERE id = ${hashtagId} AND business_id = ${tenant.businessId}
      RETURNING id, hashtag;
    `;

    if (deleted.length === 0) {
      return NextResponse.json({ success: false, message: "Hashtag not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: `Hashtag #${deleted[0].hashtag} removed.`,
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { success: false, message: (err as Error).message || "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/instagram/hashtags/[id]
 * Toggles active state of a hashtag
 */
export async function PATCH(
  req: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const hashtagId = params.id;

    const tenant = await getTenantContext();
    if (!tenant) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const isActive = body.isActive !== undefined ? Boolean(body.isActive) : true;

    const updated = await sql`
      UPDATE instagram_hashtags
      SET is_active = ${isActive}, updated_at = NOW()
      WHERE id = ${hashtagId} AND business_id = ${tenant.businessId}
      RETURNING *;
    `;

    if (updated.length === 0) {
      return NextResponse.json({ success: false, message: "Hashtag not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      hashtag: updated[0],
      message: `Hashtag #${updated[0].hashtag} ${isActive ? "enabled" : "disabled"}.`,
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { success: false, message: (err as Error).message || "Internal server error" },
      { status: 500 }
    );
  }
}
