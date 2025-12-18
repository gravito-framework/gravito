import type { GravitoOrbit, PlanetCore } from 'gravito-core'
import type { Context, Next } from 'hono'
import { AuthManager, type AuthConfig, type UserProviderResolver } from './AuthManager'

import { Gate } from './Gate'

export * from './contracts/Authenticatable'
export * from './contracts/Guard'
export * from './contracts/UserProvider'
export * from './guards/JwtGuard'
export * from './guards/SessionGuard'
export * from './guards/TokenGuard'
export * from './providers/CallbackUserProvider'
export * from './AuthManager'
export * from './Gate'
export * from './middleware/auth'
export * from './middleware/guest'
export * from './middleware/can'

export interface OrbitAuthOptions extends AuthConfig {
  exposeAs?: string
  exposeGateAs?: string
  bindings?: {
    providers?: Record<string, UserProviderResolver>
  }
}

export class OrbitAuth implements GravitoOrbit {
  public readonly gate: Gate

  constructor(private options: OrbitAuthOptions) {
    this.gate = new Gate()
  }

  install(core: PlanetCore): void {
    const { exposeAs = 'auth', exposeGateAs = 'gate', bindings } = this.options
    const logger = core.logger

    logger.info(`[OrbitAuth] Initializing Auth (Exposed as: ${exposeAs})`)

    core.app.use('*', async (c: Context, next: Next) => {
      // Create a map of resolvers from bindings
      const resolvers = new Map<string, UserProviderResolver>()
      if (bindings?.providers) {
        for (const [key, value] of Object.entries(bindings.providers)) {
          resolvers.set(key, value)
        }
      }

      const manager = new AuthManager(c, this.options, resolvers)

      c.set(exposeAs, manager)
      c.set(exposeGateAs, this.gate.forUser(async () => await manager.user()))

      await next()
    })
  }
}

declare module 'hono' {
  interface ContextVariableMap {
    auth: AuthManager
    gate: Gate
  }
}

/**
 * Functional style plugin (if needed)
 */
export default function orbitAuth(core: PlanetCore, options: OrbitAuthOptions) {
  new OrbitAuth(options).install(core)
}
