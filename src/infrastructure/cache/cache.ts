import {logger} from '../logging/logger.js';
interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

class Cache {
  private readonly store = new Map<string, CacheEntry<unknown>>();

  set<T>(key: string, data: T, ttlSeconds: number): void {
    logger.info(
      {
      cachekey: key,
      ttl: ttlSeconds,
  }, 'Cache entry set');

    this.store.set(key, {
      data,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  }

  get<T>(key: string): T | null {
    const entry = this.store.get(key);
    if (!entry){
      logger.info(
        {
        cachekey: key,
        },
        'Cache miss');
      return null;
    } 
    if (Date.now() > entry.expiresAt) {
      logger.info(
        {
        cachekey: key,
        },
        'Cache expired');

      this.store.delete(key);
      return null;
    }

    logger.info(
      {
      cachekey: key,
      },
       'Cache hit');

    return entry.data as T;

  }

  invalidate(key: string): void {
    this.store.delete(key);

    logger.info(
      {
      cachekey: key,
      },
      'Cache entry invalidated');
  }
  

  purgeExpired(): void {
    const now = Date.now();
    let removed = 0;
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.expiresAt){ 
        this.store.delete(key);
        removed++;
      }
    }
    if (removed > 0) {
    logger.info(
      {
      removed,
      },
      'Expired cache entries purged');
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