import { NextResponse } from "next/server";
import { getTenantContext } from "@/lib/services/tenant.service";
import { GET as metaConnectGET } from "@/app/api/meta/connect/route";

/**
 * POST /api/instagram/connect
 * Starts OAuth connection flow or connects via direct token
 */
export async function POST(req: Request) {
  try {
    const tenant = await getTenantContext();
    if (!tenant) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    return metaConnectGET(req);
  } catch (err: unknown) {
    return NextResponse.json(
      { success: false, message: (err as Error).message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  return metaConnectGET(req);
}
