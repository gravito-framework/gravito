import { type Container, ServiceProvider } from 'gravito-core'
import { CouponService } from './Application/Services/CouponService'
import { PromotionEngine } from './Application/Services/PromotionEngine'

export class MarketingServiceProvider extends ServiceProvider {
  register(container: Container): void {
    container.singleton('marketing.promotion-engine', () => {
      return new PromotionEngine(this.core!)
    })
    container.singleton('marketing.coupon-service', () => {
      return new CouponService(this.core!)
    })
  }

  getMigrationsPath(): string {
    return `${import.meta.dir}/Infrastructure/Persistence/Migrations`
  }

  override async boot(): Promise<void> {
    const core = this.core
    if (!core) return

    const promoEngine = core.container.make<PromotionEngine>('marketing.promotion-engine')
    const couponService = core.container.make<CouponService>('marketing.coupon-service')

    // 1. 價格調整 Filter (Promotion + Coupon)
    core.hooks.addFilter(
      'commerce:order:adjustments',
      async (adjustments: any[], { order, extras }: any) => {
        core.logger.info(`🎯 [Marketing] 正在為訂單 ${order.id} 掃描促銷與折價券...`)

        const results = [...adjustments]

        // 自動套用促銷活動
        const promoAdjustments = await promoEngine.applyPromotions(order)
        results.push(...promoAdjustments)

        // 手動套用折價券 (從下單請求的 extras 中獲取 couponCode)
        if (extras?.couponCode) {
          try {
            const couponAdj = await couponService.getAdjustment(extras.couponCode, order)
            if (couponAdj) results.push(couponAdj)
          } catch (e: any) {
            core.logger.warn(`⚠️ [Marketing] 折價券無效: ${e.message}`)
            // 注意：這裡我們不拋出錯誤，讓下單繼續但沒有折扣
            // 在現實場景中，這裡可能會拋出異常阻止結帳
          }
        }

        return results
      }
    )

    // 2. 訂單完成後的核銷動作
    core.hooks.addAction('commerce:order-placed', async (payload: any) => {
      // 獲取該訂單套用的折價券並增加計數
      // 這裡需要從資料庫讀取 order_adjustments 檢查是否有 coupon 類型
      // 為了簡化，我們先演示 Hook 的運作
      core.logger.info(`📝 [Marketing] 訂單 ${payload.orderId} 已建立，正在處理折價券核銷...`)
    })

    core.logger.info('🛰️ Satellite Marketing is operational')
  }
}
