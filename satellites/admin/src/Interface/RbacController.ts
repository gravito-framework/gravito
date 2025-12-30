import type { PlanetCore } from 'gravito-core'
import type { CreateRole } from '../Application/UseCases/CreateRole'
import type { DeleteRole } from '../Application/UseCases/DeleteRole'
import type { GetRole } from '../Application/UseCases/GetRole'
import type { ListPermissions } from '../Application/UseCases/ListPermissions'
import type { ListRoles } from '../Application/UseCases/ListRoles'
import type { UpdateRole } from '../Application/UseCases/UpdateRole'

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
          userCount: 0,
        }))
      )
    } catch (error: any) {
      return ctx.json({ message: error.message }, 500)
    }
  }

  /**
   * DELETE /roles/:id
   */
  async destroy(ctx: any) {
    const id = ctx.req.param('id')
    try {
      const useCase = this.core.container.make<DeleteRole>('admin.usecase.deleteRole')
      await useCase.execute(id)

      return ctx.json({ success: true })
    } catch (error: any) {
      return ctx.json({ message: error.message }, 400)
    }
  }

  /**
   * GET /roles/:id
   */
  async show(ctx: any) {
    const id = ctx.req.param('id')
    try {
      const useCase = this.core.container.make<GetRole>('admin.usecase.getRole')
      const role = await useCase.execute(id)

      if (!role) {
        return ctx.json({ message: 'Role not found' }, 404)
      }

      return ctx.json({
        id: role.id,
        name: role.name,
        permissions: role.permissions,
      })
    } catch (error: any) {
      return ctx.json({ message: error.message }, 500)
    }
  }

  /**
   * PATCH /roles/:id
   */
  async update(ctx: any) {
    const id = ctx.req.param('id')
    const body = await ctx.req.json()

    try {
      const useCase = this.core.container.make<UpdateRole>('admin.usecase.updateRole')
      await useCase.execute({ id, ...body })

      return ctx.json({ success: true })
    } catch (error: any) {
      return ctx.json({ message: error.message }, 400)
    }
  }

  /**
   * GET /permissions
   */
  async permissions(ctx: any) {
    try {
      const useCase = this.core.container.make<ListPermissions>('admin.usecase.listPermissions')
      const permissions = await useCase.execute()

      return ctx.json(
        permissions.map((p) => ({
          id: p.id,
          name: p.name,
          description: p.description,
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
