import { NextResponse } from "next/server";
import { sql } from "@/lib/db/neon";
import { getTenantContext } from "@/lib/services/tenant.service";

/**
 * PATCH /api/instagram/posts/[id]
 * Updates post moderation (APPROVED, REJECTED, HIDDEN), isApproved, isVisible, isFeatured
 */
export async function PATCH(
  req: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const postId = params.id;

    const tenant = await getTenantContext();
    if (!tenant) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { moderationStatus, isApproved, isVisible, isFeatured } = body;

    const existing = await sql`
      SELECT id FROM instagram_posts
      WHERE id = ${postId} AND business_id = ${tenant.businessId}
      LIMIT 1;
    `;

    if (existing.length === 0) {
      return NextResponse.json({ success: false, message: "Post not found" }, { status: 404 });
    }

    // Determine consistent approval flag if moderationStatus passed
    const computedApproved =
      moderationStatus === "APPROVED"
        ? true
        : moderationStatus === "REJECTED" || moderationStatus === "HIDDEN"
        ? false
        : isApproved !== undefined
        ? Boolean(isApproved)
        : null;

    const computedVisible =
      moderationStatus === "HIDDEN"
        ? false
        : isVisible !== undefined
        ? Boolean(isVisible)
        : null;

    const updated = await sql`
      UPDATE instagram_posts
      SET
        moderation_status = COALESCE(${moderationStatus || null}, moderation_status),
        is_approved = COALESCE(${computedApproved}, is_approved),
        is_visible = COALESCE(${computedVisible}, is_visible),
        is_featured = COALESCE(${isFeatured !== undefined ? Boolean(isFeatured) : null}, is_featured),
        updated_at = NOW()
      WHERE id = ${postId} AND business_id = ${tenant.businessId}
      RETURNING *;
    `;

    return NextResponse.json({
      success: true,
      post: updated[0],
      message: "Post updated successfully.",
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { success: false, message: (err as Error).message || "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/instagram/posts/[id]
 * Permanently removes an Instagram post record from database
 */
export async function DELETE(
  req: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const postId = params.id;

    const tenant = await getTenantContext();
    if (!tenant) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const deleted = await sql`
      DELETE FROM instagram_posts
      WHERE id = ${postId} AND business_id = ${tenant.businessId}
      RETURNING id;
    `;

    if (deleted.length === 0) {
      return NextResponse.json({ success: false, message: "Post not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Post deleted from gallery.",
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { success: false, message: (err as Error).message || "Internal server error" },
      { status: 500 }
    );
  }
}
