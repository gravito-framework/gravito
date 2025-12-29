import { UseCase } from '@gravito/enterprise'

export interface DashboardStats {
  todayRevenue: number
  pendingOrders: number
  lowStockItems: number
  activeCoupons: number
  revenueTrend: number // 百分比
}

export class GetDashboardStats extends UseCase<void, DashboardStats> {
  async execute(): Promise<DashboardStats> {
    // 模擬從各衛星聚合數據
    return {
      todayRevenue: 45800,
      pendingOrders: 12,
      lowStockItems: 5,
      activeCoupons: 8,
      revenueTrend: 15.5,
    }
  }
}
