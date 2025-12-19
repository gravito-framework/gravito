import { PlanetCore } from 'gravito-core'
import type { Context } from 'hono'

export class UserController {
  constructor(private core: PlanetCore) {}

  async index(c: Context) {
    return c.json({ message: 'User index' })
  }
}
