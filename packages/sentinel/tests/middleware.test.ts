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
    core.router.middleware(auth()).get('/protected', (c) => c.text('ok'))

    const res = await core.adapter.fetch(new Request('http://localhost/protected'))
    expect(res.status).toBe(401)
  })

  it('guest middleware redirects authenticated requests', async () => {
    const core = setupCore()

    // Mock authenticated user
    core.adapter.use('*', async (c, next) => {
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

    core.router.middleware(guest()).get('/login', (c) => c.text('login page'))

    const res = await core.adapter.fetch(new Request('http://localhost/login'))
    expect(res.status).toBe(302)
    expect(res.headers.get('Location')).toBe('/')
  })

  it('can middleware authorizes requests', async () => {
    const core = setupCore()

    // Define a gate ability
    core.adapter.use('*', async (c, next) => {
      const gate = c.get('gate') as Gate
      gate.define('edit-post', (user) => user?.getAuthIdentifier() === '1')
      await next()
    })

    core.router.middleware(can('edit-post')).get('/admin', (c) => c.text('admin'))

    // Unauthenticated -> Deny
    const res1 = await core.adapter.fetch(new Request('http://localhost/admin'))
    expect(res1.status).toBe(403)
  })
})
