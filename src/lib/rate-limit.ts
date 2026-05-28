type RateLimitEntry = {
  count: number;
  resetAt: number;
};

type RateLimitState = {
  leadsRateLimitStore?: Map<string, RateLimitEntry>;
};

const globalForRateLimit = globalThis as unknown as RateLimitState;

const leadsRateLimitStore =
  globalForRateLimit.leadsRateLimitStore ?? new Map<string, RateLimitEntry>();

if (!globalForRateLimit.leadsRateLimitStore) {
  globalForRateLimit.leadsRateLimitStore = leadsRateLimitStore;
}

function parsePositiveInteger(value: string | undefined, fallback: number): number {
  const parsed = Number.parseInt(value ?? "", 10);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }

  return parsed;
}

const envVars = process.env as unknown as Record<string, string | undefined>;

const LEADS_RATE_LIMIT_MAX_REQUESTS = parsePositiveInteger(
  envVars.LEADS_RATE_LIMIT_MAX_REQUESTS,
  10,
);

const LEADS_RATE_LIMIT_WINDOW_MS = parsePositiveInteger(
  envVars.LEADS_RATE_LIMIT_WINDOW_MS,
  60_000,
);

function pruneExpiredEntries(now: number): void {
  if (leadsRateLimitStore.size <= 500) {
    return;
  }

  for (const [key, value] of leadsRateLimitStore.entries()) {
    if (value.resetAt <= now) {
      leadsRateLimitStore.delete(key);
    }
  }
}

export function consumeLeadsRateLimit(ipAddress: string): {
  allowed: boolean;
  retryAfterSeconds: number;
} {
  const now = Date.now();
  pruneExpiredEntries(now);

  const existingEntry = leadsRateLimitStore.get(ipAddress);

  if (!existingEntry || existingEntry.resetAt <= now) {
    leadsRateLimitStore.set(ipAddress, {
      count: 1,
      resetAt: now + LEADS_RATE_LIMIT_WINDOW_MS,
    });

    return {
      allowed: true,
      retryAfterSeconds: 0,
    };
  }

  if (existingEntry.count >= LEADS_RATE_LIMIT_MAX_REQUESTS) {
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil((existingEntry.resetAt - now) / 1000)),
    };
  }

  existingEntry.count += 1;

  return {
    allowed: true,
    retryAfterSeconds: 0,
  };
}
