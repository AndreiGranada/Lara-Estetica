import { NextResponse } from "next/server";
import {
  ADMIN_SESSION_COOKIE_NAME,
  getAdminLogoutCookieOptions,
} from "@/lib/admin-auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const response = NextResponse.redirect(new URL("/admin", request.url), {
    status: 303,
  });

  response.cookies.set(ADMIN_SESSION_COOKIE_NAME, "", getAdminLogoutCookieOptions());

  return response;
}
