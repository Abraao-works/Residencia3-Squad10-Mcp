// src/cache/index.ts

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

class Cache {
  private readonly store = new Map<string, CacheEntry<unknown>>();

  set<T>(key: string, data: T, ttlSeconds: number): void {
      process.stderr.write(
    `[CACHE SET] ${key} TTL=${ttlSeconds}s\n`);

    this.store.set(key, {
      data,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  }

  get<T>(key: string): T | null {
    const entry = this.store.get(key);
    if (!entry){
      process.stderr.write(`[CACHE MISS] ${key}\n`);
      return null;
    } 
    if (Date.now() > entry.expiresAt) {
      process.stderr.write(`[CACHE EXPIRED] ${key}\n`);

      this.store.delete(key);
      return null;
    }
    process.stderr.write(`[CACHE HIT] ${key}\n`);

    return entry.data as T;

  }

  invalidate(key: string): void {
    this.store.delete(key);
  }

  purgeExpired(): void {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.expiresAt) this.store.delete(key);
    }
  }
}

export const cache = new Cache();

export const TTL = {
  companies: Number(process.env['CACHE_TTL_COMPANIES'] ?? 300),  // 5 min
  services: 300,        // 5 min
  availableDates: 60,   // 1 min
  customFields: 120,    // 2 min
} as const;