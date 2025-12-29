import type { PlanetCore } from 'gravito-core'
import type { GetDashboardStats } from '../Application/UseCases/GetDashboardStats'

export class DashboardController {
  constructor(private core: PlanetCore) {}

  async stats(ctx: any) {
    try {
      const useCase = this.core.container.make<GetDashboardStats>('admin.usecase.dashboardStats')
      const stats = await useCase.execute()
      return ctx.json(stats)
    } catch (error: any) {
      return ctx.json({ message: error.message }, 500)
    }
  }
}
