import type { MiddlewareHandler } from '@gravito/photon'
import type { AuthManager } from '../AuthManager'

export const guest = (guard?: string, redirectTo = '/'): MiddlewareHandler => {
  return async (c, next) => {
    const manager = c.get('auth') as AuthManager

    if (guard) {
      manager.shouldUse(guard)
    }

    if (await manager.check()) {
      return c.redirect(redirectTo)
    }

    await next()
    return
  }
}
