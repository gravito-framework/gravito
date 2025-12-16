import type { PlanetCore } from 'gravito-core';
import type { Context, Next } from 'hono';

export interface CacheProvider {
  get<T = unknown>(key: string): Promise<T | null>;
  set(key: string, value: unknown, ttl?: number): Promise<void>;
  delete(key: string): Promise<void>;
  clear(): Promise<void>;
}

export class MemoryCacheProvider implements CacheProvider {
  private store = new Map<string, { value: unknown; expiresAt: number }>();

  async get<T = unknown>(key: string): Promise<T | null> {
    const item = this.store.get(key);
    if (!item) return null;

    if (Date.now() > item.expiresAt) {
      this.store.delete(key);
      return null;
    }

    return item.value as T;
  }

  async set(key: string, value: unknown, ttl = 60): Promise<void> {
    this.store.set(key, {
      value,
      expiresAt: Date.now() + ttl * 1000,
    });
  }

  async delete(key: string): Promise<void> {
    this.store.delete(key);
  }

  async clear(): Promise<void> {
    this.store.clear();
  }
}

export interface OrbitCacheOptions {
  provider?: CacheProvider;
  exposeAs?: string; // Default: 'cache'
  defaultTTL?: number;
}

export default function orbitCache(core: PlanetCore, options: OrbitCacheOptions = {}) {
  const { exposeAs = 'cache', defaultTTL = 60 } = options;
  const logger = core.logger;

  logger.info(`[OrbitCache] Initializing Cache (Exposed as: ${exposeAs})`);

  const provider = options.provider || new MemoryCacheProvider();

  const cacheService = {
    // Manually map provider methods because spreading a class instance doesn't include prototype methods
    get: (key: string) => provider.get(key),
    delete: (key: string) => provider.delete(key),
    clear: () => provider.clear(),

    // "Remember" Pattern
    async remember<T>(key: string, ttl: number, callback: () => Promise<T>): Promise<T> {
      let value = await provider.get<T>(key);
      if (value) {
        core.hooks.doAction('cache:hit', { key });
        return value;
      }

      core.hooks.doAction('cache:miss', { key });
      value = await callback();
      await provider.set(key, value, ttl);
      return value;
    },

    // Override set to use defaultTTL if not provided
    set: async (key: string, value: unknown, ttl?: number) => {
      return provider.set(key, value, ttl ?? defaultTTL);
    },
  };

  // Inject generic provider into context
  core.app.use('*', async (c: Context, next: Next) => {
    c.set(exposeAs, cacheService);
    await next();
  });

  // Action: Cache Initialized
  core.hooks.doAction('cache:init', cacheService);

  return cacheService;
}
