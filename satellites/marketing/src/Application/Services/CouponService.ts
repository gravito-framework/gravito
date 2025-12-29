import type { PlanetCore } from 'gravito-core'

export class CouponService {
  constructor(private core: PlanetCore) {}

  /**
   * 根據代碼查找折價券
   */
  async findByCode(code: string): Promise<any> {
    this.core.logger.info(`[CouponService] Looking up coupon: ${code}`)
    return { code, type: 'FIXED', value: 100 }
  }

  /**
   * 計算折價券調整金額
   */
  async getAdjustment(code: string, order: any): Promise<any> {
    this.core.logger.info(`[CouponService] Calculating adjustment for: ${code}`)
    return { type: 'COUPON', amount: -100, description: `Coupon: ${code}` }
  }
}
