import type { MiddlewareHandler } from '@gravito/photon'
import { AuthenticationException } from 'gravito-core'
import type { AuthManager } from '../AuthManager'

export const auth = (guard?: string): MiddlewareHandler => {
  return async (c, next) => {
    const manager = c.get('auth') as AuthManager

    if (guard) {
      manager.shouldUse(guard)
    }

    if (!(await manager.check())) {
      throw new AuthenticationException()
    }

    await next()
  }
}
