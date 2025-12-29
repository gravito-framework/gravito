import type { PlanetCore } from 'gravito-core'
import type { LoginAdmin } from '../Application/UseCases/LoginAdmin'

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
          permissions: (user as any).props.permissions || ['*'], // 暫時預設全權限
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
    // 這裡通常會由 Middleware 解析 Token 並注入 User
    // 暫時返回一個模擬的當前用戶
    return ctx.json({
      id: 'current-admin-id',
      username: 'admin',
      email: 'admin@gravito.io',
      permissions: ['*'],
      roles: ['superadmin'],
    })
  }
}
