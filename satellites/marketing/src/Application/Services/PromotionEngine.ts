import type { PlanetCore } from 'gravito-core'

export class PromotionEngine {
  constructor(private core: PlanetCore) {}

  async applyPromotions(_order: any): Promise<any[]> {
    this.core.logger.info('[PromotionEngine] Calculating promotions...')
    const applied: any[] = []
    // 遍歷規則邏輯...
    return applied
  }
}
