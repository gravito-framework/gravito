import type { LockStore } from './LockStore'

export class MemoryLockStore implements LockStore {
  private locks = new Map<string, number>()

  async acquire(key: string, ttlSeconds: number): Promise<boolean> {
    const NOW = Date.now()
    const expiresAt = this.locks.get(key)

    if (expiresAt && expiresAt > NOW) {
      return false
    }

    this.locks.set(key, NOW + ttlSeconds * 1000)
    return true
  }

  async release(key: string): Promise<void> {
    this.locks.delete(key)
  }

  async forceAcquire(key: string, ttlSeconds: number): Promise<void> {
    this.locks.set(key, Date.now() + ttlSeconds * 1000)
  }

  async exists(key: string): Promise<boolean> {
    const expiresAt = this.locks.get(key)
    if (!expiresAt) {
      return false
    }

    if (expiresAt <= Date.now()) {
      this.locks.delete(key)
      return false
    }

    return true
  }
}
