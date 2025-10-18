import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { createAuditLog } from "@/lib/audit";

export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);

    if (user) {
      // Create audit log
      await createAuditLog(user.userId, "LOGOUT", "User", user.userId, {
        email: user.email,
      });
    }

    // Clear cookie
    const response = NextResponse.json({
      message: "Sesión cerrada exitosamente",
    });
    response.cookies.delete("auth_token");

    return response;
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { error: "Error al cerrar sesión" },
      { status: 500 }
    );
  }
}
