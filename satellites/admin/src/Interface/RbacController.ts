import type { PlanetCore } from 'gravito-core'
import type { CreateRole } from '../Application/UseCases/CreateRole'
import type { ListRoles } from '../Application/UseCases/ListRoles'

export class RbacController {
  constructor(private core: PlanetCore) {}

  /**
   * GET /roles
   */
  async index(ctx: any) {
    try {
      const useCase = this.core.container.make<ListRoles>('admin.usecase.listRoles')
      const roles = await useCase.execute()

      return ctx.json(
        roles.map((r) => ({
          id: r.id,
          name: r.name,
          permissions: r.permissions,
          userCount: 0, // 未來可結合 Repository 計算
        }))
      )
    } catch (error: any) {
      return ctx.json({ message: error.message }, 500)
    }
  }

  /**
   * POST /roles
   */
  async store(ctx: any) {
    const body = await ctx.req.json()

    try {
      const useCase = this.core.container.make<CreateRole>('admin.usecase.createRole')
      const id = await useCase.execute(body)

      return ctx.json({ id }, 201)
    } catch (error: any) {
      return ctx.json({ message: error.message }, 400)
    }
  }
}
