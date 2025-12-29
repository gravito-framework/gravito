import { DB } from '@gravito/atlas'
import type { PlanetCore } from 'gravito-core'
import type { IPromotionRule } from '../../Domain/Contracts/IPromotionRule'
import { BuyXGetYRule } from '../Rules/BuyXGetYRule'
import { CartThresholdRule } from '../Rules/CartThresholdRule'
import { CategoryDiscountRule } from '../Rules/CategoryDiscountRule'
import { MembershipLevelRule } from '../Rules/MembershipLevelRule'

export class PromotionEngine {
  private rules: Record<string, IPromotionRule> = {
    cart_threshold: new CartThresholdRule(),
    buy_x_get_y: new BuyXGetYRule(),
    membership_level: new MembershipLevelRule(),
    category_discount: new CategoryDiscountRule(),
  }

  constructor(private core: PlanetCore) {}

  async applyPromotions(order: any): Promise<any[]> {
    const activePromotions = (await DB.table('promotions')
      .where('is_active', true)
      .orderBy('priority', 'desc')
      .get()) as any[]

    const results: any[] = []

    for (const promo of activePromotions) {
      const rule = this.rules[promo.type]
      if (!rule) continue

      const config = JSON.parse(promo.configuration)

      // 支援異步匹配 (await)
      const adjustment = await rule.match(order, config)

      if (adjustment) {
        results.push(adjustment)
      }
    }

    return results
  }
}
