import { GET as metaCallbackGET } from "@/app/api/meta/callback/route";

/**
 * GET /api/instagram/callback
 * Handles OAuth return from Meta
 */
export async function GET(req: Request) {
  return metaCallbackGET(req);
}
