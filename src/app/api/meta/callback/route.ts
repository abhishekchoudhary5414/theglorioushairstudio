import { NextResponse } from "next/server";
import crypto from "crypto";
import { sql } from "@/lib/db/neon";
import { encryptToken } from "@/lib/utils/encryption";
import { InstagramGraphService } from "@/lib/services/instagram.service";
import { syncBusinessHashtagPosts } from "@/lib/services/hashtag-sync.service";

/**
 * GET /api/meta/callback
 * Handles OAuth return from Meta with code & state.
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

  const appId = process.env.META_APP_ID || "";
  const appSecret = process.env.META_APP_SECRET || "";
  const redirectUri = process.env.META_REDIRECT_URI || `${appUrl}/api/meta/callback`;

  try {
    // 1. Verify CSRF state signature
    const stateParsed = JSON.parse(Buffer.from(stateRaw, "base64url").toString("utf8"));
    const { payload, sig } = stateParsed;

    const expectedSig = crypto
      .createHmac("sha256", appSecret || "fallback_secret")
      .update(payload)
      .digest("hex");

    if (sig !== expectedSig) {
      return NextResponse.redirect(`${redirectTarget}&error=${encodeURIComponent("Invalid OAuth state. Potential CSRF detected.")}`);
    }

    const [businessId, , timestampStr] = payload.split(":");
    const timestamp = parseInt(timestampStr, 10);
    // 15-minute validity window
    if (Date.now() - timestamp > 15 * 60 * 1000) {
      return NextResponse.redirect(`${redirectTarget}&error=${encodeURIComponent("OAuth state has expired. Please try connecting again.")}`);
    }

    // 2. Exchange authorization code for short-lived user token
    const tokenRes = await InstagramGraphService.exchangeCodeForToken(code, redirectUri, appId, appSecret);

    // 3. Upgrade to 60-day long-lived access token
    const longLived = await InstagramGraphService.getLongLivedUserToken(tokenRes.access_token, appId, appSecret);
    const tokenToStore = longLived.access_token || tokenRes.access_token;
    const expiresInSeconds = longLived.expires_in || 60 * 24 * 60 * 60; // default 60 days
    const expiresAt = new Date(Date.now() + expiresInSeconds * 1000).toISOString();

    // 4. Discover connected Instagram Professional Account & Facebook Page
    const igAccount = await InstagramGraphService.getConnectedInstagramAccount(tokenToStore);

    if (!igAccount) {
      return NextResponse.redirect(
        `${redirectTarget}&error=${encodeURIComponent(
          "No Instagram Professional (Business or Creator) Account found connected to your Facebook Page. Please ensure your Instagram is connected to a Facebook Page."
        )}`
      );
    }

    // 5. Encrypt token before storing in database
    const encryptedToken = encryptToken(tokenToStore);

    // 6. Upsert into instagram_connections table
    await sql`
      INSERT INTO instagram_connections (
        business_id,
        instagram_user_id,
        instagram_username,
        facebook_page_id,
        facebook_page_name,
        profile_picture_url,
        encrypted_access_token,
        token_expires_at,
        token_type,
        connection_status,
        error_message,
        updated_at
      ) VALUES (
        ${businessId},
        ${igAccount.instagramBusinessAccountId},
        ${igAccount.instagramUsername},
        ${igAccount.facebookPageId},
        ${igAccount.facebookPageName},
        ${igAccount.profilePictureUrl || null},
        ${encryptedToken},
        ${expiresAt},
        'long_lived',
        'connected',
        NULL,
        NOW()
      )
      ON CONFLICT (business_id) DO UPDATE SET
        instagram_user_id = EXCLUDED.instagram_user_id,
        instagram_username = EXCLUDED.instagram_username,
        facebook_page_id = EXCLUDED.facebook_page_id,
        facebook_page_name = EXCLUDED.facebook_page_name,
        profile_picture_url = EXCLUDED.profile_picture_url,
        encrypted_access_token = EXCLUDED.encrypted_access_token,
        token_expires_at = EXCLUDED.token_expires_at,
        connection_status = 'connected',
        error_message = NULL,
        updated_at = NOW();
    `;

    // 7. Trigger initial background sync
    syncBusinessHashtagPosts(businessId).catch((err) => {
      console.error("[Meta Callback] Initial sync error:", err);
    });

    return NextResponse.redirect(`${redirectTarget}&success=connected`);
  } catch (err: unknown) {
    console.error("[Meta Callback] Fatal error:", err);
    return NextResponse.redirect(
      `${redirectTarget}&error=${encodeURIComponent((err as Error).message || "An unexpected error occurred during connection.")}`
    );
  }
}
