import { describe, expect, test } from 'bun:test'
import { tester } from './setup'

describe('Workflow Demo Auth', () => {
  test('register and login flow', async () => {
    const register = await tester().post('/auth/register', {
      name: 'Demo User',
      email: 'demo@example.com',
      password: 'secret',
    })
    expect(register.status).toBe(200)
    const body = await register.json()
    expect(body.token).toBeDefined()

    const login = await tester().post('/auth/login', {
      email: 'demo@example.com',
      password: 'secret',
    })
    expect(login.status).toBe(200)
    const loginBody = await login.json()
    expect(loginBody.token).toBeDefined()
  })
})
