import { NextResponse } from "next/server";
import crypto from "crypto";
import { getTenantContext } from "@/lib/services/tenant.service";

/**
 * GET /api/meta/connect
 * Starts official OAuth flow using Meta's Instagram API with Unified Login.
 *
 * Directs the user to:
 * https://www.instagram.com/oauth/authorize
 * with config_id (Unified Login configuration) or client_id/scope fallback.
 *
 * Uses a secure, tamper-proof state stored in an HTTP-only secure cookie for CSRF protection.
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

    const appId = process.env.META_APP_ID || "1154959260459572";
    const appSecret = process.env.META_APP_SECRET || "";
    const configId = process.env.META_INSTAGRAM_CONFIG_ID || "1492333992858918";
    const version = process.env.META_GRAPH_API_VERSION || "v21.0";

    // Auto-detect redirectUri from incoming request host or env
    let redirectUri = process.env.META_REDIRECT_URI;
    if (!redirectUri) {
      const host = req.headers.get("x-forwarded-host") || req.headers.get("host") || "localhost:3000";
      const proto = req.headers.get("x-forwarded-proto") || (host.includes("localhost") ? "http" : "https");
      redirectUri = `${proto}://${host}/api/meta/callback`;
    }

    // Generate secure CSRF nonce and payload
    const nonce = crypto.randomBytes(24).toString("hex");
    const timestamp = Date.now();
    const statePayload = `${tenant.businessId}:${tenant.userId}:${nonce}:${timestamp}`;
    const signature = crypto
      .createHmac("sha256", appSecret || "ditvi_secret_fallback")
      .update(statePayload)
      .digest("hex");

    const state = Buffer.from(JSON.stringify({ payload: statePayload, sig: signature })).toString("base64url");

    // Unified Login URL using Meta Instagram Login
    // Uses https://www.facebook.com/dialog/oauth or https://www.instagram.com/oauth/authorize with config_id
    let authUrl: URL;
    if (configId) {
      authUrl = new URL(`https://www.facebook.com/${version}/dialog/oauth`);
      authUrl.searchParams.set("client_id", appId);
      authUrl.searchParams.set("redirect_uri", redirectUri);
      authUrl.searchParams.set("config_id", configId);
      authUrl.searchParams.set("state", state);
      authUrl.searchParams.set("response_type", "code");
    } else {
      authUrl = new URL(`https://www.facebook.com/${version}/dialog/oauth`);
      authUrl.searchParams.set("client_id", appId);
      authUrl.searchParams.set("redirect_uri", redirectUri);
      authUrl.searchParams.set("state", state);
      authUrl.searchParams.set("scope", "instagram_basic,pages_show_list,pages_read_engagement");
      authUrl.searchParams.set("response_type", "code");
    }

    const response = NextResponse.redirect(authUrl.toString());

    // Store state in a secure, HTTP-only cookie for strict CSRF validation
    response.cookies.set("meta_oauth_state", state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production" || !redirectUri.includes("localhost"),
      sameSite: "lax",
      maxAge: 15 * 60, // 15 minutes
      path: "/",
    });

    return response;
  } catch (err: unknown) {
    console.error("[Meta Connect] Error:", err);
    return NextResponse.json(
      { success: false, message: (err as Error).message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  return GET(req);
}
