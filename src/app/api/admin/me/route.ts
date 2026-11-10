import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/jwt";

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Unauthorized or not admin" },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.userId,
        email: user.email,
        name: user.name,
        role: user.role,
        username: user.username || "admin",
      },
    });
  } catch (error) {
    console.error("Admin me API error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch session" },
      { status: 500 }
    );
  }
}
