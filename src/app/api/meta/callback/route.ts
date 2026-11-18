import { NextResponse } from "next/server";
import crypto from "crypto";
import { cookies } from "next/headers";
import { sql } from "@/lib/db/neon";
import { encryptToken } from "@/lib/utils/encryption";
import { InstagramGraphService } from "@/lib/services/instagram.service";
import { syncBusinessHashtagPosts } from "@/lib/services/hashtag-sync.service";

/**
 * GET /api/meta/callback
 * Handles OAuth return from Meta with code & state.
 * Validates CSRF state against HTTP-only cookie and payload signature.
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const stateRaw = searchParams.get("state");
  const error = searchParams.get("error");
  const errorReason = searchParams.get("error_reason");
  const errorDescription = searchParams.get("error_description");

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const redirectTarget = `${appUrl}/admin?tab=instagram`;

  if (error || !code || !stateRaw) {
    const msg = errorDescription || errorReason || error || "Authorization was cancelled or denied";
    return NextResponse.redirect(`${redirectTarget}&error=${encodeURIComponent(msg)}`);
  }

  const appId = process.env.META_APP_ID || "1154959260459572";
  const appSecret = process.env.META_APP_SECRET || "";

  // Resolve redirectUri matching registered redirect
  let redirectUri = process.env.META_REDIRECT_URI;
  if (!redirectUri) {
    const host = req.headers.get("x-forwarded-host") || req.headers.get("host") || "localhost:3000";
    const proto = req.headers.get("x-forwarded-proto") || (host.includes("localhost") ? "http" : "https");
    redirectUri = `${proto}://${host}/api/meta/callback`;
  }

  try {
    // 1. Validate state parameter against HTTP-only cookie (CSRF protection)
    const cookieStore = await cookies();
    const cookieState = cookieStore.get("meta_oauth_state")?.value;

    if (cookieState && cookieState !== stateRaw) {
      console.warn("[Meta Callback] State mismatch between cookie and query param.");
      return NextResponse.redirect(
        `${redirectTarget}&error=${encodeURIComponent("OAuth state validation failed. Potential CSRF attack detected.")}`
      );
    }

    // 2. Verify state signature
    const stateParsed = JSON.parse(Buffer.from(stateRaw, "base64url").toString("utf8"));
    const { payload, sig } = stateParsed;

    const expectedSig = crypto
      .createHmac("sha256", appSecret || "ditvi_secret_fallback")
      .update(payload)
      .digest("hex");

    if (sig !== expectedSig) {
      return NextResponse.redirect(
        `${redirectTarget}&error=${encodeURIComponent("Invalid OAuth state signature. Potential CSRF detected.")}`
      );
    }

    const [businessId, userId, , timestampStr] = payload.split(":");
    const timestamp = parseInt(timestampStr, 10);
    // 15-minute validity window
    if (Date.now() - timestamp > 15 * 60 * 1000) {
      return NextResponse.redirect(
        `${redirectTarget}&error=${encodeURIComponent("OAuth state has expired. Please try connecting again.")}`
      );
    }

    // 3. Exchange authorization code for short-lived user token
    const tokenRes = await InstagramGraphService.exchangeCodeForToken(code, redirectUri, appId, appSecret);

    // 4. Upgrade to 60-day long-lived access token
    const longLived = await InstagramGraphService.getLongLivedUserToken(tokenRes.access_token, appId, appSecret);
    const tokenToStore = longLived.access_token || tokenRes.access_token;
    const expiresInSeconds = longLived.expires_in || 60 * 24 * 60 * 60; // 60 days
    const expiresAt = new Date(Date.now() + expiresInSeconds * 1000).toISOString();

    // 5. Discover connected Instagram Account & Profile
    const igAccount = await InstagramGraphService.getConnectedInstagramAccount(tokenToStore);

    if (!igAccount) {
      return NextResponse.redirect(
        `${redirectTarget}&error=${encodeURIComponent(
          "No Instagram Professional (Business or Creator) Account found. Please ensure your Instagram is an Instagram Professional Account linked to your Meta App."
        )}`
      );
    }

    // 6. Encrypt token before storing in PostgreSQL
    const encryptedToken = encryptToken(tokenToStore);

    // 7. Upsert into instagram_connections table
    await sql`
      INSERT INTO instagram_connections (
        business_id,
        user_id,
        instagram_user_id,
        instagram_account_id,
        instagram_username,
        username,
        account_name,
        account_type,
        facebook_page_id,
        facebook_page_name,
        profile_picture_url,
        encrypted_access_token,
        token_expires_at,
        token_type,
        connection_status,
        permissions,
        error_message,
        connected_at,
        updated_at
      ) VALUES (
        ${businessId},
        ${userId || null},
        ${igAccount.instagramBusinessAccountId},
        ${igAccount.instagramBusinessAccountId},
        ${igAccount.instagramUsername},
        ${igAccount.instagramUsername},
        ${igAccount.accountName || igAccount.instagramUsername},
        ${igAccount.accountType || 'BUSINESS'},
        ${igAccount.facebookPageId || null},
        ${igAccount.facebookPageName || null},
        ${igAccount.profilePictureUrl || null},
        ${encryptedToken},
        ${expiresAt},
        'long_lived',
        'connected',
        'instagram_basic,instagram_content_publish,instagram_manage_insights,pages_show_list,pages_read_engagement',
        NULL,
        NOW(),
        NOW()
      )
      ON CONFLICT (business_id) DO UPDATE SET
        user_id = COALESCE(EXCLUDED.user_id, instagram_connections.user_id),
        instagram_user_id = EXCLUDED.instagram_user_id,
        instagram_account_id = EXCLUDED.instagram_account_id,
        instagram_username = EXCLUDED.instagram_username,
        username = EXCLUDED.username,
        account_name = EXCLUDED.account_name,
        account_type = EXCLUDED.account_type,
        facebook_page_id = EXCLUDED.facebook_page_id,
        facebook_page_name = EXCLUDED.facebook_page_name,
        profile_picture_url = EXCLUDED.profile_picture_url,
        encrypted_access_token = EXCLUDED.encrypted_access_token,
        token_expires_at = EXCLUDED.token_expires_at,
        connection_status = 'connected',
        permissions = EXCLUDED.permissions,
        error_message = NULL,
        connected_at = NOW(),
        updated_at = NOW();
    `;

    // 8. Auto-provision default hashtag if none exists
    const existingHashtags = await sql`
      SELECT id FROM instagram_hashtags WHERE business_id = ${businessId} LIMIT 1;
    `;
    if (existingHashtags.length === 0) {
      await sql`
        INSERT INTO instagram_hashtags (business_id, hashtag, is_active)
        VALUES (${businessId}, 'reflectionsalon', TRUE)
        ON CONFLICT (business_id, hashtag) DO NOTHING;
      `;
    }

    // 9. Trigger background initial synchronization
    syncBusinessHashtagPosts(businessId).catch((err) => {
      console.error("[Meta Callback] Initial sync error:", err);
    });

    const response = NextResponse.redirect(`${redirectTarget}&success=connected`);
    // Clear oauth state cookie
    response.cookies.delete("meta_oauth_state");

    return response;
  } catch (err: unknown) {
    console.error("[Meta Callback] Fatal error:", err);
    return NextResponse.redirect(
      `${redirectTarget}&error=${encodeURIComponent((err as Error).message || "An unexpected error occurred during connection.")}`
    );
  }
}
