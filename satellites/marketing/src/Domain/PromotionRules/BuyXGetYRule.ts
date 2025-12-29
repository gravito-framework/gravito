import type { IPromotionRule } from '../Contracts/IPromotionRule'
export class BuyXGetYRule implements IPromotionRule {
  name = 'buy_x_get_y'
  async apply() {
    return []
  }
}
