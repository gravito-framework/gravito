import { DB } from '@gravito/atlas'
import type { PlanetCore } from 'gravito-core'

export interface CouponAdjustment {
  label: string
  amount: number
  sourceType: 'coupon'
  sourceId: string
}

export class CouponService {
  constructor(private core: PlanetCore) {}

  /**
   * 驗證優惠券有效性
   */
  async getAdjustment(code: string, order: any): Promise<CouponAdjustment | null> {
    const coupon = (await DB.table('coupons')
      .where('code', code)
      .where('is_active', true)
      .first()) as any

    if (!coupon) {
      throw new Error(`Coupon code "${code}" is invalid or expired`)
    }

    // 1. 檢查有效期
    if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
      throw new Error('Coupon has expired')
    }

    // 2. 檢查使用上限
    if (coupon.usage_limit !== null && coupon.usage_count >= coupon.usage_limit) {
      throw new Error('Coupon usage limit reached')
    }

    // 3. 檢查最低消費 (從 configuration JSON 讀取)
    const config = coupon.configuration ? JSON.parse(coupon.configuration) : {}
    if (config.min_spend && Number(order.subtotalAmount) < config.min_spend) {
      throw new Error(`Minimum spend of ${config.min_spend} required for this coupon`)
    }

    // 4. 計算金額
    let discountAmount = 0
    if (coupon.type === 'fixed') {
      discountAmount = Number(coupon.value)
    } else if (coupon.type === 'percent') {
      discountAmount = Number(order.subtotalAmount) * (Number(coupon.value) / 100)
    }

    return {
      label: `Coupon: ${coupon.name} (-${discountAmount})`,
      amount: -discountAmount,
      sourceType: 'coupon',
      sourceId: coupon.id,
    }
  }

  /**
   * 記錄折價券已核銷 (增加計數)
   * 這裡應該被 Commerce 的 commerce:order-placed Action Hook 調用
   */
  async incrementUsage(couponId: string) {
    await DB.table('coupons').where('id', couponId).increment('usage_count', 1)
  }
}
