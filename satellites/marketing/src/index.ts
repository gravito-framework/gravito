import { type Container, ServiceProvider } from 'gravito-core'
import { PromotionEngine } from './Application/Services/PromotionEngine'

export class MarketingServiceProvider extends ServiceProvider {
  register(container: Container): void {
    container.singleton('marketing.promotion-engine', () => {
      return new PromotionEngine(this.core!)
    })
  }

  getMigrationsPath(): string {
    return `${import.meta.dir}/Infrastructure/Persistence/Migrations`
  }

  override async boot(): Promise<void> {
    const core = this.core
    if (!core) return

    const engine = core.container.make<PromotionEngine>('marketing.promotion-engine')

    // 🏎️ 核心對接點：監聽 Commerce 價格調整 Filter
    core.hooks.addFilter(
      'commerce:order:adjustments',
      async (adjustments: any[], { order }: any) => {
        core.logger.info(`🎯 [Marketing] 正在為訂單 ${order.id} 掃描促銷規則...`)

        const marketingAdjustments = await engine.applyPromotions(order)

        // 這裡我們需要將純 Object 轉為 Commerce 的 Adjustment 實體
        // 為了保持解耦，我們讓 Commerce 負責識別這些 Object
        return [...adjustments, ...marketingAdjustments]
      }
    )

    core.logger.info('🛰️ Satellite Marketing is operational')
  }
}
