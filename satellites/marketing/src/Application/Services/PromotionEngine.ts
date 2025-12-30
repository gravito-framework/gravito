import type { PlanetCore } from 'gravito-core'
import type { IPromotionRule } from '../../Domain/Contracts/IPromotionRule'
import { BuyXGetYRule } from '../../Domain/PromotionRules/BuyXGetYRule'
import { FixedAmountDiscountRule } from '../../Domain/PromotionRules/FixedAmountDiscountRule'
import { FreeShippingRule } from '../../Domain/PromotionRules/FreeShippingRule'
import { PercentageDiscountRule } from '../../Domain/PromotionRules/PercentageDiscountRule'

export class PromotionEngine {
  private rules: Record<string, IPromotionRule> = {
    fixed_discount: new FixedAmountDiscountRule(),
    percentage_discount: new PercentageDiscountRule(),
    buy_x_get_y: new BuyXGetYRule(),
    free_shipping: new FreeShippingRule(),
  }

  constructor(private core: PlanetCore) {}

  async applyPromotions(order: any): Promise<any[]> {
    this.core.logger.info('[PromotionEngine] Calculating promotions...')
    const applied: any[] = []
    // 遍歷規則邏輯...
    return applied
  }
}
