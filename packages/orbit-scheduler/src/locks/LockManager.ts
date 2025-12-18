import type { CacheManager } from '@gravito/orbit-cache'
import { CacheLockStore } from './CacheLockStore'
import type { LockStore } from './LockStore'
import { MemoryLockStore } from './MemoryLockStore'

export class LockManager {
  private store: LockStore

  constructor(driver: 'memory' | 'cache' | LockStore, context?: { cache?: CacheManager }) {
    if (typeof driver === 'object') {
      this.store = driver
    } else if (driver === 'memory') {
      this.store = new MemoryLockStore()
    } else if (driver === 'cache') {
      if (!context?.cache) {
        throw new Error('CacheManager is required for cache lock driver')
      }
      this.store = new CacheLockStore(context.cache)
    } else {
      // Default fallback
      this.store = new MemoryLockStore()
    }
  }

  async acquire(key: string, ttlSeconds: number): Promise<boolean> {
    return this.store.acquire(key, ttlSeconds)
  }

  async release(key: string): Promise<void> {
    return this.store.release(key)
  }

  async forceAcquire(key: string, ttlSeconds: number): Promise<void> {
    return this.store.forceAcquire(key, ttlSeconds)
  }

  async exists(key: string): Promise<boolean> {
    return this.store.exists(key)
  }
}
