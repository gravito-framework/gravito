import { randomUUID } from 'node:crypto'

export type DemoUser = {
  id: string
  email: string
  name: string
  password: string
}

export class AuthService {
  private users = new Map<string, DemoUser>()
  private tokens = new Map<string, string>()

  register(name: string, email: string, password: string): DemoUser {
    const id = randomUUID()
    const user = { id, name, email, password }
    this.users.set(email, user)
    return user
  }

  login(email: string, password: string): string | null {
    const user = this.users.get(email)
    if (!user || user.password !== password) {
      return null
    }
    const token = randomUUID()
    this.tokens.set(token, user.email)
    return token
  }

  findByToken(token: string): DemoUser | null {
    const email = this.tokens.get(token)
    if (!email) return null
    return this.users.get(email) ?? null
  }

  findByEmail(email: string): DemoUser | null {
    return this.users.get(email) ?? null
  }
}
