import { NextResponse } from "next/server";
import crypto from "crypto";
import { sql } from "@/lib/db/neon";
import { syncBusinessHashtagPosts } from "@/lib/services/hashtag-sync.service";

/**
 * GET /api/meta/webhook
 * Meta Webhook Verification Challenge endpoint.
 *
 * When configuring Webhooks in Meta Developer Portal:
 * Meta sends:
 * - hub.mode = "subscribe"
 * - hub.verify_token = <your INSTAGRAM_WEBHOOK_VERIFY_TOKEN>
 * - hub.challenge = <random challenge string>
 *
 * Expected Response: Plain text hub.challenge with HTTP 200.
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const mode = searchParams.get("hub.mode");
    const token = searchParams.get("hub.verify_token");
    const challenge = searchParams.get("hub.challenge");

    const expectedToken =
      process.env.INSTAGRAM_WEBHOOK_VERIFY_TOKEN ||
      "ditvi_gallery_webhook_verify_token_2026";

    if (mode === "subscribe" && token === expectedToken) {
      console.log("[Meta Webhook] Verification successful!");
      return new Response(challenge || "", {
        status: 200,
        headers: { "Content-Type": "text/plain" },
      });
    }

    console.warn("[Meta Webhook] Verification failed. Tokens do not match.");
    return NextResponse.json(
      { success: false, message: "Verification token mismatch" },
      { status: 403 }
    );
  } catch (err: unknown) {
    console.error("[Meta Webhook Verification] Error:", err);
    return NextResponse.json(
      { success: false, message: (err as Error).message || "Internal error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/meta/webhook
 * Receives real-time update notifications from Meta/Instagram (e.g. mentions, new media, comments).
 */
export async function POST(req: Request) {
  try {
    const signature = req.headers.get("x-hub-signature-256") || "";
    const appSecret = process.env.META_APP_SECRET || "";
    const rawBody = await req.text();

    // Verify HMAC-SHA256 signature if appSecret is present
    if (appSecret && signature) {
      const expectedSig =
        "sha256=" +
        crypto.createHmac("sha256", appSecret).update(rawBody).digest("hex");

      if (signature !== expectedSig) {
        console.warn("[Meta Webhook] Invalid payload signature.");
        return NextResponse.json(
          { success: false, message: "Invalid signature" },
          { status: 401 }
        );
      }
    }

    const payload = JSON.parse(rawBody || "{}");
    console.log("[Meta Webhook] Event received:", JSON.stringify(payload));

    // Handle Instagram/Page events
    if (payload.object === "instagram" || payload.object === "page") {
      const entries = payload.entry || [];
      for (const entry of entries) {
        const igUserId = entry.id;
        if (igUserId) {
          // Find matching business in database
          const businessRows = await sql`
            SELECT business_id FROM instagram_connections
            WHERE instagram_user_id = ${igUserId}
               OR instagram_account_id = ${igUserId}
            LIMIT 1;
          `;

          if (businessRows.length > 0) {
            const businessId = businessRows[0].business_id;
            // Trigger background sync for this business
            syncBusinessHashtagPosts(businessId).catch((e) =>
              console.error("[Meta Webhook] Sync error:", e)
            );
          }
        }
      }
    }

    // Always return HTTP 200 EVENT_RECEIVED to acknowledge receipt to Meta
    return new Response("EVENT_RECEIVED", { status: 200 });
  } catch (err: unknown) {
    console.error("[Meta Webhook POST] Error:", err);
    // Still return 200 so Meta does not retry indefinitely
    return new Response("EVENT_RECEIVED", { status: 200 });
  }
}
