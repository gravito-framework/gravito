import { type Container, ServiceProvider } from 'gravito-core'

export class MarketingServiceProvider extends ServiceProvider {
  register(container: Container): void {
    // 註冊行銷引擎單例
  }

  override boot(): void {
    const core = this.core
    if (!core) return

    core.logger.info('🛰️ Satellite Marketing is operational')

    /**

         * GASS 聯動：監聽訂單計算 Filter

         * 當 Commerce 計算金額時，Marketing 自動注入「點火測試 9 折優惠」

         */

    core.hooks.addFilter('commerce:order:adjustments', async (adjustments: any[], args: any) => {
      const payload = args as { order: any }

      core.logger.info(`[Marketing] Inspecting order for discounts: ${payload.order.id}`)

      // 模擬點火測試優惠
      adjustments.push({
        label: 'Ignition Promo (10% OFF)',
        amount: -(payload.order.subtotalAmount * 0.1),
        sourceType: 'promo',
        sourceId: 'IGNITION_2025',
      })

      return adjustments
    })
  }
}
