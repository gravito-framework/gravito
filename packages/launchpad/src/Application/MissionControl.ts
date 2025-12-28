import type { IDockerAdapter, IRouterAdapter } from '../Domain/Interfaces'
import type { Mission } from '../Domain/Mission'
import type { PayloadInjector } from './PayloadInjector'
import type { PoolManager } from './PoolManager'

export class MissionControl {
  constructor(
    private poolManager: PoolManager,
    private injector: PayloadInjector,
    private docker: IDockerAdapter,
    private router?: IRouterAdapter
  ) {}

  /**
   * 處理發射流程
   */
  async launch(mission: Mission, onTelemetry: (type: string, data: any) => void): Promise<string> {
    console.log(`[MissionControl] 準備發射任務: ${mission.id}`)

    // 1. 從池子抓火箭
    const rocket = await this.poolManager.assignMission(mission)

    // 2. 注入代碼並點火
    await this.injector.deploy(rocket)

    // [New] 3. 分配域名 (例如 pr-123.dev.local)
    // 注意：這裡假設我們開發機已經設定好泛域名解析
    const domain = `${mission.id}.dev.local`.toLowerCase()
    rocket.assignDomain(domain)

    // 註冊到反向代理 (假設容器內部跑在 3000 port)
    if (this.router) {
      // 在本地 Docker 環境，我們透過 host network 訪問，所以目標是 localhost:3000
      // 實務上應該是容器的 IP:Port
      this.router.register(domain, 'http://localhost:3000')
    }

    // 4. 啟動即時遙測
    this.docker.streamLogs(rocket.containerId, (log) => {
      onTelemetry('log', { rocketId: rocket.id, text: log })
    })

    // 定期獲取效能數據
    const statsTimer = setInterval(async () => {
      if (rocket.status === 'DECOMMISSIONED' || rocket.status === 'IDLE') {
        clearInterval(statsTimer)
        return
      }
      const stats = await this.docker.getStats(rocket.containerId)
      onTelemetry('stats', { rocketId: rocket.id, ...stats })
    }, 5000)

    // [Auto-Recycle] 設定任務生存時間 (例如 10 分鐘)
    // 實務上這個時間可以從 Mission 設定中讀取
    const ttl = 10 * 60 * 1000
    setTimeout(async () => {
      console.log(`[MissionControl] 任務 ${mission.id} TTL 已到期，執行自動回收...`)
      clearInterval(statsTimer) // 停止監控
      await this.poolManager.recycle(mission.id)
      onTelemetry('log', { rocketId: rocket.id, text: '--- MISSION EXPIRED (TTL) ---' })
    }, ttl)

    return rocket.id
  }
}
