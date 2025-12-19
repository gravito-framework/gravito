import { describe, expect, it } from 'bun:test'
import { PlanetCore } from 'gravito-core'
import type { Authenticatable } from '../src/contracts/Authenticatable'
import orbitAuth, { auth, CallbackUserProvider, can, type Gate, guest } from '../src/index'

class TestUser implements Authenticatable {
  constructor(public id: string) {}
  getAuthIdentifier() {
    return this.id
  }
}

describe('Auth Middleware', () => {
  const setupCore = () => {
    const core = new PlanetCore()
    orbitAuth(core, {
      defaults: { guard: 'api' },
      guards: {
        api: { driver: 'jwt', provider: 'users', secret: 'secret' },
      },
      providers: {
        users: { driver: 'callback' },
      },
      bindings: {
        providers: {
          users: (_config) =>
            new CallbackUserProvider(
              async (id) => new TestUser(String(id)),
              async () => true
            ),
        },
      },
    })
    return core
  }

  it('auth middleware blocks unauthenticated requests', async () => {
    const core = setupCore()
    core.app.get('/protected', auth(), (c) => c.text('ok'))

    const res = await core.app.request('/protected')
    expect(res.status).toBe(401)
  })

  it('guest middleware redirects authenticated requests', async () => {
    const core = setupCore()

    // Mock authenticated user
    core.app.use('*', async (c, next) => {
      const manager = c.get('auth')
      manager.guard = () =>
        ({
          check: async () => true,
          user: async () => new TestUser('1'),
          id: async () => '1',
          validate: async () => true,
          setUser: () => {},
          getProvider: () => {},
          setProvider: () => {},
        }) as any
      await next()
    })

    core.app.get('/login', guest(), (c) => c.text('login page'))

    const res = await core.app.request('/login')
    expect(res.status).toBe(302)
    expect(res.headers.get('Location')).toBe('/')
  })

  it('can middleware authorizes requests', async () => {
    const core = setupCore()

    // Define a gate ability
    core.app.use('*', async (c, next) => {
      const gate = c.get('gate') as Gate
      gate.define('edit-post', (user) => user?.getAuthIdentifier() === '1')
      await next()
    })

    core.app.get('/admin', can('edit-post'), (c) => c.text('admin'))

    // Unauthenticated -> Deny
    const res1 = await core.app.request('/admin')
    expect(res1.status).toBe(403)
  })
})
