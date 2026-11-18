import { NextResponse } from "next/server";
import crypto from "crypto";
import { getTenantContext } from "@/lib/services/tenant.service";

/**
 * GET /api/meta/connect
 * Starts OAuth flow for Meta / Instagram Graph API.
 * 
 * Generates CSRF state containing { businessId, nonce, timestamp, signature }
 * and redirects business owner to Facebook OAuth Dialog.
 */
export async function GET(req: Request) {
  try {
    const tenant = await getTenantContext();
    if (!tenant) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Please log in first." },
        { status: 401 }
      );
    }

    const appId = process.env.META_APP_ID;
    const redirectUri = process.env.META_REDIRECT_URI;
    const appSecret = process.env.META_APP_SECRET || "fallback_secret";

    if (!appId || !redirectUri) {
      return NextResponse.json(
        {
          success: false,
          message: "Meta integration is not configured. Please set META_APP_ID and META_REDIRECT_URI.",
        },
        { status: 500 }
      );
    }

    // Generate tamper-proof HMAC signed state
    const nonce = crypto.randomBytes(16).toString("hex");
    const timestamp = Date.now();
    const statePayload = `${tenant.businessId}:${nonce}:${timestamp}`;
    const signature = crypto
      .createHmac("sha256", appSecret)
      .update(statePayload)
      .digest("hex");
    const state = Buffer.from(JSON.stringify({ payload: statePayload, sig: signature })).toString("base64url");

    // Scopes strictly required for Instagram Professional hashtag discovery via Facebook Login
    const scopes = [
      "instagram_basic",
      "pages_show_list",
      "pages_read_engagement",
    ].join(",");

    const authUrl = new URL("https://www.facebook.com/v21.0/dialog/oauth");
    authUrl.searchParams.set("client_id", appId);
    authUrl.searchParams.set("redirect_uri", redirectUri);
    authUrl.searchParams.set("state", state);
    authUrl.searchParams.set("scope", scopes);
    authUrl.searchParams.set("response_type", "code");

    return NextResponse.redirect(authUrl.toString());
  } catch (err: unknown) {
    console.error("[Meta Connect] Error:", err);
    return NextResponse.json(
      { success: false, message: (err as Error).message || "Internal server error" },
      { status: 500 }
    );
  }
}
