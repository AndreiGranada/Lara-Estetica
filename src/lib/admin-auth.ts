import { createHmac, timingSafeEqual } from "node:crypto";

const envVars = process.env as unknown as Record<string, string | undefined>;

const DEV_DEFAULT_ADMIN_USERNAME = "admin";
const DEV_DEFAULT_ADMIN_PASSWORD = "admin123";
const DEV_DEFAULT_SESSION_SECRET = "local-admin-session-secret-change-me";
const ADMIN_SESSION_DURATION_SECONDS = 60 * 60 * 12;

export const ADMIN_SESSION_COOKIE_NAME = "lara_admin_session";

type AdminSessionPayload = {
  username: string;
  expiresAt: number;
};

type AdminSession = {
  isAuthenticated: boolean;
  username: string | null;
};

function getOptionalEnv(name: string): string | null {
  const value = envVars[name]?.trim();
  return value ? value : null;
}

function getAdminUsername(): string | null {
  const configuredValue = getOptionalEnv("ADMIN_USERNAME");

  if (configuredValue) {
    return configuredValue;
  }

  if (process.env.NODE_ENV !== "production") {
    return DEV_DEFAULT_ADMIN_USERNAME;
  }

  return null;
}

function getAdminPassword(): string | null {
  const configuredValue = getOptionalEnv("ADMIN_PASSWORD");

  if (configuredValue) {
    return configuredValue;
  }

  if (process.env.NODE_ENV !== "production") {
    return DEV_DEFAULT_ADMIN_PASSWORD;
  }

  return null;
}

function getAdminSessionSecret(): string | null {
  const configuredValue = getOptionalEnv("ADMIN_SESSION_SECRET");

  if (configuredValue) {
    return configuredValue;
  }

  if (process.env.NODE_ENV !== "production") {
    return DEV_DEFAULT_SESSION_SECRET;
  }

  return null;
}

function safeEqual(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return timingSafeEqual(leftBuffer, rightBuffer);
}

function signPayload(encodedPayload: string, secret: string): string {
  return createHmac("sha256", secret).update(encodedPayload).digest("base64url");
}

function parsePayload(encodedPayload: string): AdminSessionPayload | null {
  try {
    const rawPayload = Buffer.from(encodedPayload, "base64url").toString("utf8");
    const parsedPayload = JSON.parse(rawPayload) as AdminSessionPayload;

    if (
      typeof parsedPayload.username !== "string" ||
      !parsedPayload.username ||
      typeof parsedPayload.expiresAt !== "number"
    ) {
      return null;
    }

    return parsedPayload;
  } catch {
    return null;
  }
}

export function getAdminAuthConfigError(): string | null {
  if (!getAdminUsername() || !getAdminPassword() || !getAdminSessionSecret()) {
    return "Painel admin sem configuração. Defina ADMIN_USERNAME, ADMIN_PASSWORD e ADMIN_SESSION_SECRET.";
  }

  return null;
}

export function verifyAdminCredentials(username: string, password: string): boolean {
  const expectedUsername = getAdminUsername();
  const expectedPassword = getAdminPassword();

  if (!expectedUsername || !expectedPassword) {
    return false;
  }

  return safeEqual(username, expectedUsername) && safeEqual(password, expectedPassword);
}

export function createAdminSessionToken(username: string): string | null {
  const secret = getAdminSessionSecret();

  if (!secret) {
    return null;
  }

  const payload: AdminSessionPayload = {
    username,
    expiresAt: Date.now() + ADMIN_SESSION_DURATION_SECONDS * 1000,
  };

  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = signPayload(encodedPayload, secret);

  return `${encodedPayload}.${signature}`;
}

export function readAdminSession(sessionToken: string | undefined): AdminSession {
  if (!sessionToken) {
    return { isAuthenticated: false, username: null };
  }

  const secret = getAdminSessionSecret();

  if (!secret) {
    return { isAuthenticated: false, username: null };
  }

  const [encodedPayload, signature] = sessionToken.split(".");

  if (!encodedPayload || !signature) {
    return { isAuthenticated: false, username: null };
  }

  const expectedSignature = signPayload(encodedPayload, secret);

  if (!safeEqual(signature, expectedSignature)) {
    return { isAuthenticated: false, username: null };
  }

  const payload = parsePayload(encodedPayload);

  if (!payload || payload.expiresAt <= Date.now()) {
    return { isAuthenticated: false, username: null };
  }

  return {
    isAuthenticated: true,
    username: payload.username,
  };
}

export function getAdminSessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: ADMIN_SESSION_DURATION_SECONDS,
  };
}

export function getAdminLogoutCookieOptions() {
  return {
    ...getAdminSessionCookieOptions(),
    maxAge: 0,
  };
}
