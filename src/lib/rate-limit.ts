type RateEntry = {
  tokens: number;
  resetAt: number;
};

const DEFAULT_WINDOW_MS = 60_000;
const store = new Map<string, RateEntry>();

export function rateLimit(key: string, limit = 30, windowMs = DEFAULT_WINDOW_MS) {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || entry.resetAt < now) {
    store.set(key, {
      tokens: limit - 1,
      resetAt: now + windowMs,
    });
    return { allowed: true, remaining: limit - 1 };
  }

  if (entry.tokens <= 0) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  entry.tokens -= 1;
  return { allowed: true, remaining: entry.tokens, resetAt: entry.resetAt };
}
