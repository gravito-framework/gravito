import type { PlanetCore } from '@gravito/core'
import type { ListAdmins } from '../Application/UseCases/ListAdmins'
import type { LoginAdmin } from '../Application/UseCases/LoginAdmin'
import type { UpdateAdmin } from '../Application/UseCases/UpdateAdmin'

export class AuthController {
  constructor(private core: PlanetCore) {}

  /**
   * POST /auth/login
   */
  async login(ctx: any) {
    const { email, password } = await ctx.req.json()

    try {
      const useCase = this.core.container.make<LoginAdmin>('admin.usecase.login')
      const { user, token } = await useCase.execute({ email, passwordRaw: password })

      return ctx.json({
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          permissions: (user as any).props.permissions || ['*'],
          roles: user.roles,
        },
      })
    } catch (error: any) {
      return ctx.json({ message: error.message }, 401)
    }
  }

  /**
   * GET /auth/me
   */
  async me(ctx: any) {
    return ctx.json({
      id: 'current-admin-id',
      username: 'admin',
      email: 'admin@gravito.io',
      permissions: ['*'],
      roles: ['superadmin'],
    })
  }

  /**
   * GET /users
   */
  async users(ctx: any) {
    try {
      const useCase = this.core.container.make<ListAdmins>('admin.usecase.listAdmins')
      const users = await useCase.execute()

      return ctx.json(
        users.map((u) => ({
          id: u.id,
          username: u.username,
          email: u.email,
          roles: u.roles,
          isActive: u.isActive,
        }))
      )
    } catch (error: any) {
      return ctx.json({ message: error.message }, 500)
    }
  }

  /**
   * PATCH /users/:id
   */
  async update(ctx: any) {
    const id = ctx.req.param('id')
    const body = await ctx.req.json()

    try {
      const useCase = this.core.container.make<UpdateAdmin>('admin.usecase.updateAdmin')
      await useCase.execute({ id, ...body })

      return ctx.json({ success: true })
    } catch (error: any) {
      return ctx.json({ message: error.message }, 400)
    }
  }
}
