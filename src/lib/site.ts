export function getSiteUrl(): string {
  const envVars = process.env as unknown as Record<string, string | undefined>;
  const candidate = envVars.NEXT_PUBLIC_SITE_URL?.trim();

  if (candidate) {
    try {
      return new URL(candidate).origin;
    } catch {
      // Fallback para ambiente local quando a URL estiver invalida.
    }
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error("NEXT_PUBLIC_SITE_URL nao definida ou invalida para producao.");
  }

  return "http://localhost:3000";
}
