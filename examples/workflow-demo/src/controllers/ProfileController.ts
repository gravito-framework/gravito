import type { GravitoContext } from 'gravito-core'
import type { DemoUser } from '../services/AuthService'

export class ProfileController {
  show = (ctx: GravitoContext) => {
    const user = ctx.get('user') as DemoUser | undefined
    return ctx.json({ profile: { id: user?.id, email: user?.email, name: user?.name } })
  }

  update = async (ctx: GravitoContext) => {
    const payload = await ctx.req.json()
    const user = ctx.get('user') as DemoUser | undefined
    const { name } = payload
    if (!name) {
      return ctx.json({ error: 'name is required' }, 400)
    }
    user.name = name
    return ctx.json({ profile: { id: user.id, email: user.email, name: user.name } })
  }
}
