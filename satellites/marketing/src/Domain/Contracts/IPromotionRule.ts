export interface MarketingAdjustment {
  label: string
  amount: number
  sourceType: string
  sourceId: string
}

export interface IPromotionRule {
  /**
   * 檢查訂單是否符合此規則，若符合，回傳調整項
   */
  match(order: any, config: any): MarketingAdjustment | null
}
