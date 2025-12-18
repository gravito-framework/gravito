import { describe, expect, it, mock } from 'bun:test'
import { PlanetCore } from 'gravito-core'
import orbitAuth, { CallbackUserProvider } from '../src/index'
import type { Authenticatable } from '../src/contracts/Authenticatable'

class TestUser implements Authenticatable {
  constructor(public id: string) { }
  getAuthIdentifier() { return this.id }
}

describe('OrbitAuth', () => {
  it('should register auth manager in context', async () => {
    const core = new PlanetCore()

    // Setup plugin
    orbitAuth(core, {
      defaults: { guard: 'api' }, // Use JWT guard for test as it's simpler? OR session
      guards: {
        api: { driver: 'jwt', provider: 'users', secret: 'secret' }
      },
      providers: {
        users: { driver: 'callback' }
      },
      bindings: {
        providers: {
          users: (config) => new CallbackUserProvider(
            async (id) => new TestUser(String(id)),
            async () => true
          )
        }
      }
    })

    // Register a route to test injection
    core.app.get('/test', (c) => {
      const auth = c.get('auth')
      return c.json({
        hasAuth: !!auth,
        isAuthManager: auth.constructor.name === 'AuthManager'
      })
    })

    const res = await core.app.request('/test')
    const json = await res.json()

    expect(json.hasAuth).toBe(true)
    expect(json.isAuthManager).toBe(true)
  })
})
