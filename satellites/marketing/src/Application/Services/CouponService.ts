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
}
