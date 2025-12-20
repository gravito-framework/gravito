/**
 * Hashing interface
 */
export interface Hasher {
  /**
   * Hash the given value
   */
  make(value: string, options?: Record<string, unknown>): Promise<string>

  /**
   * Check the given plain value against a hash
   */
  check(value: string, hashedValue: string): Promise<boolean>

  /**
   * Check if the given hash has been hashed using the given options
   */
  needsRehash(hashedValue: string, options?: Record<string, unknown>): boolean
}

/**
 * Bun Hasher
 * Uses Bun's native password hashing (bcrypt by default)
 */
export class BunHasher implements Hasher {
  async make(
    value: string,
    options?: { algorithm?: 'bcrypt' | 'argon2id'; cost?: number }
  ): Promise<string> {
    const bun = Bun as unknown as {
      password: {
        hash(v: string, o?: unknown): Promise<string>
      }
    }
    return await bun.password.hash(value, options)
  }

  async check(value: string, hashedValue: string): Promise<boolean> {
    const bun = Bun as unknown as {
      password: {
        verify(v: string, h: string): Promise<boolean>
      }
    }
    return await bun.password.verify(value, hashedValue)
  }

  needsRehash(_hashedValue: string, _options?: Record<string, unknown>): boolean {
    return false
  }
}
