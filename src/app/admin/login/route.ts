import { NextResponse } from "next/server";
import {
  ADMIN_SESSION_COOKIE_NAME,
  createAdminSessionToken,
  getAdminAuthConfigError,
  getAdminSessionCookieOptions,
  verifyAdminCredentials,
} from "@/lib/admin-auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const formData = await request.formData();
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (getAdminAuthConfigError()) {
    return NextResponse.redirect(new URL("/admin?error=config", request.url), {
      status: 303,
    });
  }

  if (!verifyAdminCredentials(username, password)) {
    return NextResponse.redirect(new URL("/admin?error=invalid", request.url), {
      status: 303,
    });
  }

  const sessionToken = createAdminSessionToken(username);

  if (!sessionToken) {
    return NextResponse.redirect(new URL("/admin?error=config", request.url), {
      status: 303,
    });
  }

  const response = NextResponse.redirect(new URL("/admin", request.url), {
    status: 303,
  });

  response.cookies.set(
    ADMIN_SESSION_COOKIE_NAME,
    sessionToken,
    getAdminSessionCookieOptions(),
  );

  return response;
}
