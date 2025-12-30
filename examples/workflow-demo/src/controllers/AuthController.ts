import type { GravitoContext, GravitoNext } from 'gravito-core'
import { AuthorizationException } from 'gravito-core'
import { AuthService } from '../services/AuthService'

const authService = new AuthService()

export class AuthController {
  private readonly service = authService

  register = async (ctx: GravitoContext) => {
    const body = await ctx.req.json()
    const { name, email, password } = body
    if (!name || !email || !password) {
      return ctx.json({ error: 'Missing fields' }, 400)
    }
    if (this.service.findByEmail(email)) {
      return ctx.json({ error: 'Email already registered' }, 409)
    }
    const user = this.service.register(name, email, password)
    const token = this.service.login(email, password)
    return ctx.json({ token, user: { id: user.id, email: user.email, name: user.name } })
  }

  login = async (ctx: GravitoContext) => {
    const body = await ctx.req.json()
    const { email, password } = body
    const token = this.service.login(email, password)
    if (!token) {
      return ctx.json({ error: 'Invalid credentials' }, 401)
    }
    const user = this.service.findByEmail(email)!
    return ctx.json({ token, user: { id: user.id, email: user.email, name: user.name } })
  }

  requireAuth = async (ctx: GravitoContext, next: GravitoNext) => {
    const header = ctx.req.header('authorization') ?? ''
    const token = header.replace(/^Bearer\s+/i, '')
    const user = this.service.findByToken(token)
    if (!user) {
      throw new AuthorizationException('Invalid or missing token')
    }
    ctx.set('user', user)
    await next()
  }

  getUser = (ctx: GravitoContext) => ctx.state.user
}
