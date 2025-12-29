import { DB } from '@gravito/atlas'
import type { PlanetCore } from 'gravito-core'
import type { IPromotionRule } from '../../Domain/Contracts/IPromotionRule'
import { CartThresholdRule } from '../Rules/CartThresholdRule'

export class PromotionEngine {
  private rules: Record<string, IPromotionRule> = {
    cart_threshold: new CartThresholdRule(),
  }

  constructor(private core: PlanetCore) {}

  /**
   * 套用促銷規則並回傳調整項
   */
  async applyPromotions(order: any): Promise<any[]> {
    // 1. 抓取有效的促銷活動 (Standard Mode: 直接查 DB)
    // 未來 Sport Mode 會從 Memory Cache 抓取
    const activePromotions = (await DB.table('promotions')
      .where('is_active', true)
      .orderBy('priority', 'desc')
      .get()) as any[]

    const results: any[] = []

    for (const promo of activePromotions) {
      const rule = this.rules[promo.type]
      if (!rule) continue

      const config = JSON.parse(promo.configuration)
      const adjustment = rule.match(order, config)

      if (adjustment) {
        // 將調整項封裝成 Commerce 識別的格式
        // 注意：這裡我們需要動態導入 Commerce 的 Adjustment 類別，
        // 或者直接回傳符合介面的 Plain Object。
        results.push(adjustment)
      }
    }

    return results
  }
}
